import React from 'react';
import usePollPaymentStatus from './hooks/use-poll-payment-status';
import { BOOKING_STATUS, PAYMENT_STATUS_CONFIG } from '@/config/payment.config';
import { LinkWithIcon } from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import API_CONFIG from '@/config/api.config';
import useMutation from '@/lib/hooks/useMutation';
import { describeError } from '@/lib/api-error';
import { toast } from 'sonner';

const RetryPayment = ({ bookingId }) => {
  const { mutate, pending } = useMutation(
    API_CONFIG.BOOKING.PAYMENT_BOOKING.URL(bookingId),
    API_CONFIG.BOOKING.PAYMENT_BOOKING.METHOD
  );
  const retry = () =>
    mutate(null, {
      onSuccess: (response) => {
        const url = response?.data?.sessionUrl;
        if (typeof url === 'string' && url.startsWith('https://')) window.location.assign(url);
      },
      onError: (error) =>
        toast('Could not restart the payment', { type: 'error', description: describeError(error) }),
    });
  return (
    <Button onClick={retry} disabled={pending} size="lg">
      {pending && <Icon icon="spinner" className="animate-spin" />}
      Try payment again
    </Button>
  );
};

const PaymentStatus = () => {
  const { paymentStatus, errorMessage, bookingId } = usePollPaymentStatus();
  const config = PAYMENT_STATUS_CONFIG[paymentStatus];

  return (
    <div className="container flex items-center justify-center py-16" aria-live="polite">
      <div className="flex flex-col items-center justify-center max-w-lg gap-4">
        {paymentStatus === BOOKING_STATUS.PROCESSING && (
          <Icon icon="spinner" size={40} className="animate-spin text-brand" />
        )}
        <div className="space-y-2">
          <h1 className={`text-xl font-bold text-center ${config.className}`}>{config.title}</h1>
          <p className="text-base font-medium text-center text-muted-foreground">
            {paymentStatus === BOOKING_STATUS.ERROR && errorMessage ? errorMessage : config.description}
          </p>
        </div>
        {paymentStatus === BOOKING_STATUS.PAYMENT_NOT_COMPLETED && (
          <RetryPayment bookingId={bookingId} />
        )}
        {paymentStatus !== BOOKING_STATUS.PROCESSING && (
          <LinkWithIcon to={'/me/booking-history'} icon="bookingHistory" variant="outline">
            View My Bookings
          </LinkWithIcon>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
