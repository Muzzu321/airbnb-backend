import React from 'react';
import { Button } from '@/components/ui/button';
import API_CONFIG from '@/config/api.config';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import AddGuestsDialog from './add-guests-dialog';
import useMutation from '@/lib/hooks/useMutation';
import { describeError } from '@/lib/api-error';

const CheckoutGuests = ({ booking, onBookingChange }) => {
  const guests = booking.guests || [];
  const { mutate, pending } = useMutation(
    API_CONFIG.BOOKING.SET_GUESTS.URL(booking.id),
    API_CONFIG.BOOKING.SET_GUESTS.METHOD
  );

  // The backend replaces the guest list, so removing = re-sending the remaining ids.
  const removeGuestHandler = (guestId) => {
    const remaining = guests.filter((guest) => guest.id !== guestId).map((guest) => guest.id);
    mutate(remaining, {
      onSuccess: (response) => {
        onBookingChange(response.data);
        toast('Guest removed', { type: 'success' });
      },
      onError: (error) => {
        toast('Could not remove the guest', { type: 'error', description: describeError(error) });
      },
    });
  };

  return (
    <div className="px-4 space-y-4">
      <h3 className="text-base font-semibold">Guest Details</h3>
      {guests.length === 0 && (
        <p className="text-sm text-muted-foreground">Add at least one guest to continue to payment.</p>
      )}
      {guests.length > 0 && (
        <ul className="grid grid-cols-2 gap-6">
          {guests.map((guest) => (
            <li key={guest.id} className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-full w-7 h-7 bg-secondary">
                  <span className="text-sm font-medium leading-4 uppercase">{guest.name.charAt(0)}</span>
                </div>
                <p className="text-sm font-medium">{guest.name}</p>
              </div>
              <Button
                size="icon"
                className="w-6 h-6"
                variant="ghost"
                aria-label="Remove guest"
                title={guests.length === 1 ? 'At least one guest is required' : 'Remove guest'}
                disabled={pending || guests.length === 1}
                onClick={() => removeGuestHandler(guest.id)}
              >
                <Icon icon="close" size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <AddGuestsDialog
        bookingId={booking.id}
        bookingGuests={guests}
        onBookingChange={onBookingChange}
      />
    </div>
  );
};

export default CheckoutGuests;
