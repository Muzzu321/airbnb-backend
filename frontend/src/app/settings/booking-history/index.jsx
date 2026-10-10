import React from 'react';
import { Separator } from '@/components/ui/separator';
import useGetBookingHistory from './use-get-booking-history';
import BookingCard from './booking-card';
import ApiError from '@/components/api-error';
import { LoadingSpinner } from '@/components/ui/loader';

const BookingHistory = () => {
  const { data, error, pending, refetch } = useGetBookingHistory();

  if (error) {
    return <ApiError errorMessage={error} className="h-[calc(100vh-200px)]" />;
  }

  if (pending)
    return <LoadingSpinner containerClassName={'min-h-[calc(100vh-200px)]'} />;

  return (
    <section>
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold">My Booking History</h1>
        <p className="text-muted-foreground">
          View your bookings and cancel confirmed ones.
        </p>
      </div>
      <Separator className="mt-4 mb-6" />
      <div className="space-y-4">
        {data.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">
            You have no bookings yet.
          </p>
        )}
        {data.map((booking) => (
          <BookingCard key={booking.id} {...booking} onChanged={refetch} />
        ))}
      </div>
    </section>
  );
};

export default BookingHistory;
