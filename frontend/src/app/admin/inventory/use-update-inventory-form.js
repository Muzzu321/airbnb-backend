
import useMutation from '@/lib/hooks/useMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import API_CONFIG from '@/config/api.config';
import { describeError } from '@/lib/api-error';
import { z } from 'zod';

const UpdateInventorySchema = z.object({
  bookingDates: z.object({
    from: z.date(),
    to: z.date(),
  }),
  surgeFactor: z.coerce
    .number({ message: 'The surge factor is invalid' })
    .min(1, 'Surge factor must be at least 1'),
  closed: z.boolean(),
});

function useUpdateInventoryForm(inventoriesRefetch) {
  const { roomId } = useParams();
  const { mutate, pending } = useMutation(
    API_CONFIG.ADMIN.INVENTORY(roomId),
    'PATCH'
  );
  const form = useForm({
    resolver: zodResolver(UpdateInventorySchema),
    defaultValues: {
      bookingDates: {
        from: dayjs().toDate(),
        to: dayjs().toDate(),
      },
      surgeFactor: 1,
      closed: false,
    },
  });
  const updateInventoryHandler = React.useCallback(
    (data) => {
      const queries = {
        startDate: dayjs(data.bookingDates.from).format('YYYY-MM-DD'),
        endDate: dayjs(data.bookingDates.to).format('YYYY-MM-DD'),
        surgeFactor: data.surgeFactor,
        closed: data.closed,
      };

      mutate(queries, {
        onSuccess: () => {
          form.reset();
          inventoriesRefetch();
          toast("Inventory updated successfully", {
            type: 'success'
          })
        },
        onError: (error) => {
          toast('Could not update inventory', {
            description: describeError(error),
            type: 'error',
          });
        },
      });
    },
    [form, mutate, inventoriesRefetch]
  );
  return {
    form,
    updateInventoryHandler,
    pending,
  };
}

export default useUpdateInventoryForm;
