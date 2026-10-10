import React from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import API_CONFIG from '@/config/api.config';
import useMutation from '@/lib/hooks/useMutation';
import { describeError } from '@/lib/api-error';

// Backend rule: only CONFIRMED bookings can be cancelled; the payment is refunded in full
// through Stripe and the rooms are released. If the refund fails the booking stays CONFIRMED.
const CancelBooking = ({ bookingId, onCancelled }) => {
  const [open, setOpen] = React.useState(false);
  const { mutate, pending } = useMutation(
    API_CONFIG.BOOKING.CANCEL_BOOKING.URL(bookingId),
    API_CONFIG.BOOKING.CANCEL_BOOKING.METHOD
  );

  const handleCancel = async () => {
    await mutate(null, {
      onSuccess: () => {
        toast('Booking cancelled. Your payment is being refunded.', {
          type: 'success',
        });
        setOpen(false);
        onCancelled?.();
      },
      onError: (err) => {
        toast('Could not cancel the booking', {
          description: describeError(err),
          type: 'error',
        });
      },
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Cancel booking
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              The rooms will be released and the full amount refunded to your
              original payment method. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Keep booking</AlertDialogCancel>
            <Button
              variant="destructive"
              isLoading={pending}
              disabled={pending}
              onClick={handleCancel}
            >
              Yes, cancel booking
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CancelBooking;
