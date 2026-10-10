import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import API_CONFIG from '@/config/api.config';
import useMutation from '@/lib/hooks/useMutation';
import { describeError } from '@/lib/api-error';

import React from 'react';
import { toast } from 'sonner';

const InitiatePaymentsButton = ({ booking }) => {
  const { mutate, pending } = useMutation(
    API_CONFIG.BOOKING.PAYMENT_BOOKING.URL(booking.id),
    API_CONFIG.BOOKING.PAYMENT_BOOKING.METHOD
  );
  const hasGuests = (booking.guests || []).length > 0;

  const initiatePayment = () => {
    mutate(null, {
      onSuccess: (response) => {
        const sessionUrl = response?.data?.sessionUrl;
        // Only ever redirect to an https Stripe-hosted page returned by our backend.
        if (typeof sessionUrl === 'string' && sessionUrl.startsWith('https://')) {
          window.location.assign(sessionUrl);
        } else {
          toast('Could not start the payment', {
            type: 'error',
            description: 'The server did not return a valid payment link.',
          });
        }
      },
      onError: (error) => {
        toast('Could not start the payment', {
          type: 'error',
          description: describeError(error),
        });
      },
    });
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={initiatePayment}
        size="lg"
        disabled={pending || !hasGuests}
        className="w-full h-12 shadow-lg uppercase text-base font-semibold transition-opacity  bg-purple-700 hover:bg-purple-700/80"
      >
        <Icon size="30" icon={pending ? 'spinner' : 'shield'} className={pending ? 'animate-spin' : ''} />
        Proceed to Pay
      </Button>
      {!hasGuests && (
        <p className="text-xs text-center text-muted-foreground">Add at least one guest to enable payment.</p>
      )}
    </div>
  );
};

export default InitiatePaymentsButton;
