package com.muzammil.projects.airBnbApp.service;

import com.muzammil.projects.airBnbApp.entity.Booking;
import com.muzammil.projects.airBnbApp.entity.enums.BookingStatus;
import com.muzammil.projects.airBnbApp.repository.BookingRepository;
import com.muzammil.projects.airBnbApp.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Releases rooms held by bookings that were never paid.
 *
 * - RESERVED / GUESTS_ADDED: held for 10 minutes (same window BookingServiceImpl enforces).
 * - PAYMENTS_PENDING: the Stripe Checkout session lives 30 minutes (see CheckoutServiceImpl); the hold is
 *   released 35 minutes after the payment was started, so a customer who is still legitimately paying is never
 *   expired underneath them.
 *
 * Without this, the reservedCount of abandoned bookings would never be decremented and rooms would become
 * permanently unavailable.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingExpiryService {

    private final BookingRepository bookingRepository;
    private final InventoryRepository inventoryRepository;

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expireUnpaidBookings() {
        LocalDateTime now = LocalDateTime.now();

        List<Booking> notYetPaying = bookingRepository.findByBookingStatusInAndCreatedAtBefore(
                List.of(BookingStatus.RESERVED, BookingStatus.GUESTS_ADDED), now.minusMinutes(10));
        notYetPaying.forEach(this::expire);

        List<Booking> abandonedPayments = bookingRepository.findByBookingStatusAndUpdatedAtBefore(
                BookingStatus.PAYMENTS_PENDING, now.minusMinutes(35));
        abandonedPayments.forEach(this::expire);
    }

    private void expire(Booking booking) {
        Long roomId = booking.getRoom().getId();
        inventoryRepository.getInventoryAndLockBeforeUpdate(roomId, booking.getCheckInDate(), booking.getCheckOutDate());
        inventoryRepository.releaseReservation(roomId, booking.getCheckInDate(), booking.getCheckOutDate(),
                booking.getRoomsCount());
        booking.setBookingStatus(BookingStatus.EXPIRED);
        bookingRepository.save(booking);
        log.info("Booking {} expired and its reservation was released", booking.getId());
    }
}
