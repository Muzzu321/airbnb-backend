import API_CONFIG from '@/config/api.config';
import { BOOKING_STATUS, TERMINAL_BOOKING_STATUSES } from '@/config/payment.config';
import axiosInstance from '@/lib/axios-instance';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

const POLLING_DELAY_MS = 3000;
const MAX_ATTEMPTS = 20; // ~1 minute

/**
 * Polls GET /bookings/{id}/status. The booking is only ever shown as paid when the BACKEND reports CONFIRMED
 * (set by the signed Stripe webhook) - the success redirect from Stripe alone proves nothing.
 * Polling stops on a terminal status, on an unrecoverable error, after MAX_ATTEMPTS, and on unmount.
 */
function usePollPaymentStatus() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const returnedWithoutPaying = searchParams.get('cancelled') === 'true';

  const [paymentStatus, setPaymentStatus] = useState(BOOKING_STATUS.PROCESSING);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let stopped = false;
    let timer = null;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await axiosInstance.get(
          API_CONFIG.BOOKING.STATUS_BOOKING.URL(bookingId)
        );
        if (stopped) return;
        const status = response.data?.bookingStatus;

        if (TERMINAL_BOOKING_STATUSES.includes(status)) {
          setPaymentStatus(status);
          return;
        }
        if (returnedWithoutPaying) {
          setPaymentStatus(BOOKING_STATUS.PAYMENT_NOT_COMPLETED);
          return;
        }
      } catch (err) {
        if (stopped) return;
        if ([401, 403, 404].includes(err.status)) {
          setErrorMessage(err.message);
          setPaymentStatus(BOOKING_STATUS.ERROR);
          return;
        }
        // network hiccup / 5xx: keep trying until the attempts run out
      }

      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        setPaymentStatus(BOOKING_STATUS.CONFIRMATION_DELAYED);
        return;
      }
      timer = setTimeout(poll, POLLING_DELAY_MS);
    };

    poll();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [bookingId, returnedWithoutPaying]);

  return { paymentStatus, errorMessage, bookingId };
}

export default usePollPaymentStatus;
