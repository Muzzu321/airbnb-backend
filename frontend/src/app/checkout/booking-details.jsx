import { Separator } from '@/components/ui/separator';
import dayjs from 'dayjs';
import React from 'react'
import CheckoutGuests from './guests/checkout-guests';
import { formatCurrency } from '@/lib/utils';

const DateBlock = ({ label, value }) => {
  const parts = dayjs(value).format('ddd DD MMM YYYY').split(' ');
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium uppercase text-muted-foreground">{label}</span>
      <p className="text-sm" role="status">
        {parts[0]}&nbsp;
        <span className="text-xl font-bold">{`${parts[1]} ${parts[2]}`}</span>
        &nbsp;{parts[3]}
      </p>
    </div>
  );
};

const BookingDetails = ({ booking, onBookingChange }) => {
  const hotel = booking.hotel || {};
  const photo = hotel.photos?.[0];

  return (
    <section className="space-y-4">
      <div className="flex gap-2 px-4">
        {photo && (
          <div>
            <img width={130} height={85} src={photo} alt={hotel.name} className="rounded-lg" />
          </div>
        )}
        <div className="flex-1 space-y-1">
          <h2 className="text-base font-semibold">{hotel.name}</h2>
          <p className="text-sm text-muted-foreground">
            {[hotel.contactInfo?.address, hotel.city].filter(Boolean).join(', ')}
          </p>
        </div>
      </div>
      <div className="flex items-stretch gap-2 border-dashed border-y border-y-blue-100">
        <div
          aria-label="check-in and check-out dates"
          className="flex items-center justify-between flex-1 gap-4 p-4 bg-blue-50/40"
        >
          <DateBlock label="Check in" value={booking.checkInDate} />
          <DateBlock label="Check out" value={booking.checkOutDate} />
        </div>
        <div className="flex items-center flex-1 gap-1 p-4 bg-blue-50/40">
          <p className="text-sm font-medium">
            <span className="text-base font-semibold">{booking.roomsCount}</span>
            {booking.roomsCount > 1 ? ' Rooms' : ' Room'}
          </p>
          <span className="text-muted-foreground">|</span>
          <p className="text-sm font-medium">{booking.room?.type}</p>
        </div>
      </div>
      <Separator />
      <CheckoutGuests booking={booking} onBookingChange={onBookingChange} />
      <div className="px-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Price</span>
          <p className="text-base font-bold">{formatCurrency(booking.amount)}</p>
        </div>
      </div>
    </section>
  );
};

export default BookingDetails
