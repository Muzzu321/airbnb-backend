package com.muzammil.projects.airBnbApp.service;

import com.muzammil.projects.airBnbApp.dto.BookingDto;
import com.muzammil.projects.airBnbApp.dto.BookingRequest;
import com.muzammil.projects.airBnbApp.dto.GuestDto;
import com.muzammil.projects.airBnbApp.dto.HotelDto;
import com.muzammil.projects.airBnbApp.dto.HotelReportDto;
import com.muzammil.projects.airBnbApp.dto.RoomDto;
import com.muzammil.projects.airBnbApp.dto.UserDto;
import com.muzammil.projects.airBnbApp.entity.*;
import com.muzammil.projects.airBnbApp.entity.enums.BookingStatus;
import com.muzammil.projects.airBnbApp.exception.ResourceNotFoundException;
import com.muzammil.projects.airBnbApp.exception.UnAuthorisedException;
import com.muzammil.projects.airBnbApp.repository.*;
import com.muzammil.projects.airBnbApp.strategy.PricingService;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Refund;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.muzammil.projects.airBnbApp.util.AppUtils.getCurrentUser;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService{

    private final GuestRepository guestRepository;
    private final ModelMapper modelMapper;
    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final InventoryRepository inventoryRepository;
    private final CheckoutService checkoutService;
    private final PricingService pricingService;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    @Transactional
    public BookingDto initialiseBooking(BookingRequest bookingRequest) {

        log.info("Initialising booking for hotel : {}, room: {}, date {}-{}", bookingRequest.getHotelId(),
                bookingRequest.getRoomId(), bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate());

        if (bookingRequest.getCheckInDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in date cannot be in the past");
        }
        if (!bookingRequest.getCheckOutDate().isAfter(bookingRequest.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after the check-in date");
        }

        Hotel hotel = hotelRepository.findById(bookingRequest.getHotelId()).orElseThrow(() ->
                new ResourceNotFoundException("Hotel not found with id: "+bookingRequest.getHotelId()));

        Room room = roomRepository.findById(bookingRequest.getRoomId()).orElseThrow(() ->
                new ResourceNotFoundException("Room not found with id: "+bookingRequest.getRoomId()));

        if (!room.getHotel().getId().equals(hotel.getId())) {
            throw new IllegalArgumentException("Room " + room.getId() + " does not belong to hotel " + hotel.getId());
        }

        List<Inventory> inventoryList = inventoryRepository.findAndLockAvailableInventory(room.getId(),
                bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate(), bookingRequest.getRoomsCount());

        long daysCount = ChronoUnit.DAYS.between(bookingRequest.getCheckInDate(), bookingRequest.getCheckOutDate())+1;

        if (inventoryList.size() != daysCount) {
            throw new IllegalStateException("Room is not available anymore");
        }

        // Reserve the room/ update the booked count of inventories
        inventoryRepository.initBooking(room.getId(), bookingRequest.getCheckInDate(),
                bookingRequest.getCheckOutDate(), bookingRequest.getRoomsCount());

        BigDecimal priceForOneRoom = pricingService.calculateTotalPrice(inventoryList);
        BigDecimal totalPrice = priceForOneRoom.multiply(BigDecimal.valueOf(bookingRequest.getRoomsCount()));

        Booking booking = Booking.builder()
                .bookingStatus(BookingStatus.RESERVED)
                .hotel(hotel)
                .room(room)
                .checkInDate(bookingRequest.getCheckInDate())
                .checkOutDate(bookingRequest.getCheckOutDate())
                .user(getCurrentUser())
                .roomsCount(bookingRequest.getRoomsCount())
                .amount(totalPrice)
                .build();

        booking = bookingRepository.save(booking);
        return toDto(booking);
    }

    /**
     * Sets the guest list of a booking. The list REPLACES any previously chosen guests, so the
     * client can add and remove guests by re-sending the full selection (allowed while the booking
     * is RESERVED or GUESTS_ADDED, i.e. before payment starts).
     */
    @Override
    @Transactional
    public BookingDto addGuests(Long bookingId, List<Long> guestIdList) {

        log.info("Adding guests for booking with id: {}", bookingId);

        if (guestIdList == null || guestIdList.isEmpty()) {
            throw new IllegalArgumentException("At least one guest is required");
        }

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() ->
                new ResourceNotFoundException("Booking not found with id: "+bookingId));

        User user = getCurrentUser();

        if (!user.equals(booking.getUser())) {
            throw new UnAuthorisedException("Booking does not belong to this user with id: "+user.getId());
        }

        if (hasBookingExpired(booking)) {
            throw new IllegalStateException("Booking has already expired");
        }

        if(booking.getBookingStatus() != BookingStatus.RESERVED
                && booking.getBookingStatus() != BookingStatus.GUESTS_ADDED) {
            throw new IllegalStateException("Booking is not under reserved state, cannot change guests");
        }

        Set<Guest> guests = new HashSet<>();
        for (Long guestId: new LinkedHashSet<>(guestIdList)) {
            Guest guest = guestRepository.findById(guestId)
                    .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id: "+guestId));
            if (!user.equals(guest.getUser())) {
                throw new UnAuthorisedException("Guest " + guestId + " does not belong to this user");
            }
            guests.add(guest);
        }

        booking.setGuests(guests);
        booking.setBookingStatus(BookingStatus.GUESTS_ADDED);
        booking = bookingRepository.save(booking);

        return toDto(booking);
    }

    @Override
    @Transactional
    public String initiatePayments(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new ResourceNotFoundException("Booking not found with id: "+bookingId)
        );

        User user = getCurrentUser();

        if (!user.equals(booking.getUser())) {
            throw new UnAuthorisedException("Booking does not belong to this user with id: "+user.getId());
        }

        if (hasBookingExpired(booking)) {
            throw new IllegalStateException("Booking has already expired");
        }

        // Payment may only start once guests are added. PAYMENTS_PENDING is allowed so a customer who
        // abandoned Stripe Checkout can retry; the previous session is closed first so it cannot be paid later.
        if (booking.getBookingStatus() != BookingStatus.GUESTS_ADDED
                && booking.getBookingStatus() != BookingStatus.PAYMENTS_PENDING) {
            throw new IllegalStateException("Payment cannot be started while the booking is " + booking.getBookingStatus());
        }

        if (booking.getBookingStatus() == BookingStatus.PAYMENTS_PENDING && booking.getPaymentSessionId() != null) {
            closePreviousPaymentSession(booking.getPaymentSessionId());
        }

        String statusPage = frontendUrl + "/payments/" + bookingId + "/status";
        String sessionUrl = checkoutService.getCheckoutSession(booking, statusPage, statusPage + "?cancelled=true");

        booking.setBookingStatus(BookingStatus.PAYMENTS_PENDING);
        bookingRepository.save(booking);

        return sessionUrl;
    }

    private void closePreviousPaymentSession(String sessionId) {
        try {
            Session previous = Session.retrieve(sessionId);
            if ("complete".equals(previous.getStatus())) {
                throw new IllegalStateException("Payment for this booking was already completed and is awaiting confirmation");
            }
            if ("open".equals(previous.getStatus())) {
                previous.expire();
            }
        } catch (StripeException e) {
            log.error("Could not close previous Stripe session {}", sessionId, e);
            throw new IllegalStateException("Could not close the previous payment session. Please try again.");
        }
    }

    @Override
    @Transactional
    public void capturePayment(Event event) {
        if ("checkout.session.completed".equals(event.getType())) {
            log.info("Stripe event type: {}", event.getType());

            Session session = extractSession(event);

            if (session == null) {
                log.error("Stripe Session deserialization returned null. Event ID: {}", event.getId());
                throw new IllegalStateException("Unable to deserialize Stripe Checkout Session");
            }

            String sessionId = session.getId();
            log.info("Stripe session ID received: {}", sessionId);

            if (!"paid".equals(session.getPaymentStatus())) {
                log.warn("Session {} completed with payment_status={}; not confirming", sessionId, session.getPaymentStatus());
                return;
            }

            Booking booking = bookingRepository
                    .findByPaymentSessionId(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found for session ID: " + sessionId));

            // Stripe may deliver the same event more than once: confirming twice would corrupt inventory counts.
            if (booking.getBookingStatus() == BookingStatus.CONFIRMED) {
                log.info("Booking {} already confirmed; ignoring duplicate webhook", booking.getId());
                return;
            }

            if (booking.getBookingStatus() != BookingStatus.PAYMENTS_PENDING) {
                log.error("Payment received for booking {} but it is in state {}. Manual refund/review required (session {})",
                        booking.getId(), booking.getBookingStatus(), sessionId);
                return;
            }

            booking.setBookingStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            inventoryRepository.findAndLockReservedInventory(
                    booking.getRoom().getId(),
                    booking.getCheckInDate(),
                    booking.getCheckOutDate(),
                    booking.getRoomsCount()
            );

            inventoryRepository.confirmBooking(
                    booking.getRoom().getId(),
                    booking.getCheckInDate(),
                    booking.getCheckOutDate(),
                    booking.getRoomsCount()
            );

            log.info("Successfully confirmed the booking for Booking ID: {}", booking.getId());

        } else {
            log.warn("Unhandled event type: {}", event.getType());
        }
    }

    private Session extractSession(Event event) {
        var deserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = deserializer.getObject().orElse(null);
        if (stripeObject == null) {
            // Happens when the event's API version differs from the one stripe-java was built for
            try {
                stripeObject = deserializer.deserializeUnsafe();
            } catch (EventDataObjectDeserializationException e) {
                log.error("Could not deserialize Stripe event {}", event.getId(), e);
                return null;
            }
        }
        return stripeObject instanceof Session session ? session : null;
    }

    @Override
    @Transactional
    public void cancelBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new ResourceNotFoundException("Booking not found with id: "+bookingId)
        );

        User user = getCurrentUser();

        if (!user.equals(booking.getUser())) {
            throw new UnAuthorisedException("Booking does not belong to this user with id: "+user.getId());
        }

        if(booking.getBookingStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed bookings can be cancelled");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        inventoryRepository.getInventoryAndLockBeforeUpdate(booking.getRoom().getId(), booking.getCheckInDate(),
                booking.getCheckOutDate());

        inventoryRepository.cancelBooking(booking.getRoom().getId(), booking.getCheckInDate(),
                booking.getCheckOutDate(), booking.getRoomsCount());

        // handle the refund (full refund of the payment). If Stripe fails the whole transaction rolls back
        // so the booking stays CONFIRMED and can be retried.
        try {
            Session session = Session.retrieve(booking.getPaymentSessionId());
            RefundCreateParams refundParams = RefundCreateParams.builder()
                    .setPaymentIntent(session.getPaymentIntent())
                    .build();

            Refund.create(refundParams);
        } catch (StripeException e) {
            log.error("Refund failed for booking {}", bookingId, e);
            throw new IllegalStateException("The refund could not be processed by the payment provider. The booking was not cancelled; please try again later.");
        }
    }

    @Override
    public BookingStatus getBookingStatus(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new ResourceNotFoundException("Booking not found with id: "+bookingId)
        );

        User user = getCurrentUser();

        if (!user.equals(booking.getUser())) {
            throw new UnAuthorisedException("Booking does not belong to this user with id: "+user.getId());
        }

        return booking.getBookingStatus();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDto> getAllBookingsByHotelId(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new ResourceNotFoundException("Hotel not " +
                "found with ID: "+hotelId));
        User user = getCurrentUser();

        log.info("Getting all booking for the hotel with ID: {}", hotelId);

        if(!user.equals(hotel.getOwner())) throw new AccessDeniedException("You are not the owner of hotel with id: "+hotelId);

        List<Booking> bookings = bookingRepository.findByHotel(hotel);

        return bookings.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public HotelReportDto getHotelReport(Long hotelId, LocalDate startDate, LocalDate endDate) {

        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new ResourceNotFoundException("Hotel not " +
                "found with ID: "+hotelId));
        User user = getCurrentUser();

        log.info("Generating report for hotel with ID: {}", hotelId);

        if(!user.equals(hotel.getOwner())) throw new AccessDeniedException("You are not the owner of hotel with id: "+hotelId);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Booking> bookings = bookingRepository.findByHotelAndCreatedAtBetween(hotel, startDateTime, endDateTime);

        Long totalConfirmedBookings = bookings
                .stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.CONFIRMED)
                .count();

        BigDecimal totalRevenueOfConfirmedBookings = bookings.stream()
                .filter(booking -> booking.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(Booking::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgRevenue = totalConfirmedBookings == 0 ? BigDecimal.ZERO :
                totalRevenueOfConfirmedBookings.divide(BigDecimal.valueOf(totalConfirmedBookings), RoundingMode.HALF_UP);

        return new HotelReportDto(totalConfirmedBookings, totalRevenueOfConfirmedBookings, avgRevenue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDto> getMyBookings() {
        User user = getCurrentUser();

        return bookingRepository.findByUser(user)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public boolean hasBookingExpired(Booking booking) {
        return booking.getCreatedAt().plusMinutes(10).isBefore(LocalDateTime.now());
    }

    /**
     * Explicit entity -> DTO mapping (hotel/room/user are LAZY proxies; they are un-proxied before mapping
     * and the entities themselves, including the owner/password, are never serialised).
     */
    private BookingDto toDto(Booking booking) {
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setRoomsCount(booking.getRoomsCount());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        dto.setBookingStatus(booking.getBookingStatus());
        dto.setAmount(booking.getAmount());

        Set<GuestDto> guests = booking.getGuests() == null ? new HashSet<>() :
                booking.getGuests().stream()
                        .map(guest -> modelMapper.map(guest, GuestDto.class))
                        .collect(Collectors.toSet());
        dto.setGuests(guests);

        dto.setHotel(modelMapper.map(Hibernate.unproxy(booking.getHotel()), HotelDto.class));
        dto.setRoom(modelMapper.map(Hibernate.unproxy(booking.getRoom()), RoomDto.class));
        dto.setUser(modelMapper.map(Hibernate.unproxy(booking.getUser()), UserDto.class));
        return dto;
    }

}
