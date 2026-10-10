import API_CONFIG from '@/config/api.config';
import useMutation from '@/lib/hooks/useMutation';
import { useTravelerContext } from '@/lib/providers/travelers-context';
import React from 'react';
import { toast } from 'sonner';

function useRemoveGuest({ guestId, setIsDialogOpen }) {
  const { setTravelers } = useTravelerContext();
  const { mutate, pending } = useMutation(
    API_CONFIG.TRAVELLER.DELETE_TRAVELLER.URL(guestId),
    API_CONFIG.TRAVELLER.DELETE_TRAVELLER.METHOD
  );

  const removeGuest = React.useCallback(async () => {
    await mutate(null, {
      onSuccess: () => {
        setTravelers((prevTravellers) =>
          prevTravellers.filter((traveller) => traveller.id !== guestId)
        );
        toast('Guest Removed successfully', {
          type: 'success'
        })
        setIsDialogOpen(false);
      },
      onError: (err) => {
        toast('Error: ' + (err.status || ''), {
          description: err.message,
          type: 'error',
        });
      },
    });
  }, [mutate]);

  return { removeGuest, pending };
}
export default useRemoveGuest;
