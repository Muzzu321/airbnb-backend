import React from 'react'
import useInitCheckout from './hooks/use-init-checkout'
import { Separator } from '@/components/ui/separator';
import BookingDetails from './booking-details';
import InitiatePaymentsButton from './init-payments-button';
import { LoadingSpinner } from '@/components/ui/loader';
import ApiError from '@/components/api-error';
import { LinkWithIcon } from '@/components/ui/link';

const CheckoutPage = () => {

  const {data: booking, pending, error, errorInfo, setBooking} = useInitCheckout();

  if(pending) {
    return <LoadingSpinner containerClassName={'min-h-[calc(100vh-200px)]'} />;
  }

  if(error || !booking) {
    return (
      <div>
        <ApiError
          errorName={errorInfo?.status === 409 ? 'Room no longer available' : 'Could not start your booking'}
          errorMessage={error}
          className="h-[calc(100vh-300px)]"
        />
        <div className="flex justify-center">
          <LinkWithIcon to="/" icon="leftArrow" variant="outline">Back to search</LinkWithIcon>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex items-center my-20">
      <div className="flex-1 max-w-2xl py-4 mx-auto border border-border shadow-lg rounded-xl bg-background">
        <div className="px-4">
          <h1 className="text-xl font-bold">Booking Checkout</h1>
          <p className="text-xs text-muted-foreground">Your rooms are held for 10 minutes. Add guests and pay to confirm.</p>
        </div>
        <Separator className="my-4" />
        <BookingDetails booking={booking} onBookingChange={setBooking} />
        <div className="px-4 mt-6">
          <InitiatePaymentsButton booking={booking} />
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage
