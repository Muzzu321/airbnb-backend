import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import Icon from '@/components/ui/icon';
import { bookingStatusVariant } from '@/config/app.config';
import { cn, formatCurrency, getDefaultProfile } from '@/lib/utils';
import CancelBooking from './cancel-booking';
import dayjs from 'dayjs';

const BookingGuestList = ({ guests = [] }) => {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className="flex items-center gap-1"
          role="button"
          aria-label="Cancellation Policy"
          tabIndex={0}
        >
          <p className="text-sm font-medium">{guests.length}</p>
          <Icon icon="info" size="16" className="shrink-0 text-primary" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        side="left"
        className="w-[min(350px,var(--radix-popper-available-width)-40px)] space-y-3"
        role="tooltip"
        aria-live="polite"
      >
        <h3 className="text-base font-semibold">Guest List</h3>
        <ul className="space-y-3">
          {guests.map((guest, index) => (
            <li key={index} role="listitem">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    loading="lazy"
                    src={getDefaultProfile((guest.name || '?').charAt(0))}
                    width={36}
                    height={36}
                  />
                  <AvatarFallback>
                    {guest?.name && guest.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-medium">{guest.name}</h3>
                  <p className="text-xs capitalize text-muted-foreground">
                    {guest.gender}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
};
const BookingCard = ({
  hotel,
  roomsCount,
  checkInDate,
  checkOutDate,
  bookingStatus,
  room,
  guests,
  amount,
  id,
  onChanged,
}) => {
  const isBookingConfirmed = bookingStatus === 'CONFIRMED';
  return (
    <article className="border rounded-lg">
      <div className="p-4 space-y-1 border-b">
        <div>
          <h2 className="text-xl font-semibold">
            {hotel?.name || 'Hotel'}
          </h2>
          {(room?.type || hotel?.city) && (
            <p className="text-sm text-muted-foreground">
              {[room?.type, hotel?.city].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            {`Booking ID - ${id}`}
          </p>
          <Icon icon="dot" size="16" className="text-muted-foreground" />
          <Badge
            className={cn(
              'text-white px-2 py-1',
              bookingStatusVariant[bookingStatus]?.className
            )}
          >
            {bookingStatusVariant[bookingStatus]?.text}
          </Badge>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Check in
          </span>
          <div>
            <p
              className="text-base font-semibold"
              aria-label="Check-in date"
            >
              {dayjs(checkInDate).format('ddd, DD MMM YYYY')}
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Check out
          </span>
          <div>
            <p
              className="text-base font-semibold"
              aria-label="Check-out date"
            >
              {dayjs(checkOutDate).format('ddd, DD MMM YYYY')}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Icon icon="room" size="20" />
            <p className="text-sm font-medium">
              {`${roomsCount} ${roomsCount > 1 ? 'Rooms' : 'Room'}`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon icon="travelers" size="20" />
            <BookingGuestList guests={guests} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-b-[inherit] gap-4 px-4 py-3 bg-blue-50">
        <div>
          <p className="text-base font-semibold">
            {`${isBookingConfirmed ? 'Paid' : 'Total'} - ${formatCurrency(amount)}`}
          </p>
        </div>
        {isBookingConfirmed && (
          <CancelBooking bookingId={id} onCancelled={onChanged} />
        )}
      </div>
    </article>
  );
};

export default BookingCard;
