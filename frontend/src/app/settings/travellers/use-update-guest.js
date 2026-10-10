import API_CONFIG from '@/config/api.config';
import useMutation from '@/lib/hooks/useMutation';
import React from 'react';
import { toast } from 'sonner';

function useUpdateGuestInfo({
  guestId,
  setIsUpdateDialogOpen,
  onGuestInfoUpdate,
}) {
  const { data, pending, mutate } = useMutation(
    API_CONFIG.TRAVELLER.UPDATE_TRAVELLER.URL(guestId),
    API_CONFIG.TRAVELLER.UPDATE_TRAVELLER.METHOD
  );

  const updateGuestInfo = React.useCallback(
    async (data) => {
      await mutate(data, {
        onSuccess: () => {
          toast('Guest updated successfully', {
            type: 'success',
          });
          if (onGuestInfoUpdate && typeof onGuestInfoUpdate === 'function') {
            onGuestInfoUpdate(data);
          }
          setIsUpdateDialogOpen(false);
        },
        onError: (err) => {
          toast('Error: ' + (err.status || ''), {
            description: err.message,
            type: 'error',
          });
        },
      });
    },
    [mutate]
  );
  return { updateGuestInfo, pending, data };
}

export default useUpdateGuestInfo;
