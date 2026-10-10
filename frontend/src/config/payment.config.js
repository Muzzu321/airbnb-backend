// Backend BookingStatus values that END the polling.
export const TERMINAL_BOOKING_STATUSES = ['CONFIRMED', 'CANCELLED', 'EXPIRED'];

// View states of the payment status page. CONFIRMED/CANCELLED/EXPIRED mirror backend BookingStatus;
// the others are UI-only states.
export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  PROCESSING: 'PROCESSING',
  PAYMENT_NOT_COMPLETED: 'PAYMENT_NOT_COMPLETED', // user came back from Stripe without paying
  CONFIRMATION_DELAYED: 'CONFIRMATION_DELAYED', // polling window elapsed, status still unconfirmed
  ERROR: 'ERROR', // the status request itself failed
};

export const PAYMENT_STATUS_CONFIG = {
  [BOOKING_STATUS.PROCESSING]: {
    title: 'Confirming Your Payment',
    className: '',
    description:
      'Waiting for the payment provider to confirm your payment. This usually takes a few seconds.',
  },
  [BOOKING_STATUS.CONFIRMED]: {
    title: 'Booking Confirmed',
    className: 'text-green-600',
    description: 'Your payment was received and your booking is confirmed.',
  },
  [BOOKING_STATUS.PAYMENT_NOT_COMPLETED]: {
    className: 'text-amber-600',
    title: 'Payment Not Completed',
    description:
      'You left the payment page before paying. Your rooms stay held for a short time - you can try the payment again.',
  },
  [BOOKING_STATUS.CANCELLED]: {
    className: 'text-amber-600',
    title: 'Booking Cancelled',
    description: 'This booking has been cancelled.',
  },
  [BOOKING_STATUS.EXPIRED]: {
    className: 'text-gray-600',
    title: 'Booking Expired',
    description:
      'The hold on your rooms expired before payment was completed. Please search again and start a new booking.',
  },
  [BOOKING_STATUS.CONFIRMATION_DELAYED]: {
    className: 'text-orange-600',
    title: 'Still Waiting For Confirmation',
    description:
      'We have not received the payment confirmation yet. If you completed the payment it can still arrive - check My Bookings in a minute. You will not be charged twice.',
  },
  [BOOKING_STATUS.ERROR]: {
    className: 'text-red-600',
    title: 'Could Not Check Your Booking',
    description: 'We could not retrieve the status of this booking.',
  },
};
