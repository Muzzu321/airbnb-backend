import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import API_CONFIG from '@/config/api.config';
import useMutation from '@/lib/hooks/useMutation';
import { describeError } from '@/lib/api-error';

// Mirrors the backend RoomDto constraints (type required, basePrice >= 0.01, totalCount >= 1, capacity >= 1).
const RoomSchema = z.object({
  type: z.string().trim().min(1, 'Room type is required'),
  basePrice: z.coerce.number().min(0.01, 'Base price must be greater than 0'),
  photos: z.array(z.string().url('Photo must be a valid URL')),
  amenities: z.array(z.string()),
  totalCount: z.coerce.number().int().min(1, 'Total count must be at least 1'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
});

/** `room` present => edit (PUT), absent => create (POST). */
function useRoomForm(room) {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const isEdit = Boolean(room);

  const { mutate, pending } = useMutation(
    isEdit
      ? API_CONFIG.ADMIN.ROOM(hotelId, room.id)
      : API_CONFIG.ADMIN.ROOMS(hotelId),
    isEdit ? 'PUT' : 'POST'
  );

  const form = useForm({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      type: room?.type ?? '',
      basePrice: room?.basePrice ?? '',
      photos: room?.photos ?? [],
      amenities: room?.amenities ?? [],
      totalCount: room?.totalCount ?? '',
      capacity: room?.capacity ?? '',
    },
  });

  const submitHandler = React.useCallback(
    (data) => {
      mutate(data, {
        onSuccess: () => {
          toast(isEdit ? 'Room updated successfully' : 'Room created successfully', {
            type: 'success',
          });
          navigate(`/admin/hotels/${hotelId}/rooms`);
        },
        onError: (error) => {
          toast(isEdit ? 'Could not update room' : 'Could not create room', {
            description: describeError(error),
            type: 'error',
          });
        },
      });
    },
    [mutate, navigate, hotelId, isEdit]
  );

  return { form, submitHandler, pending, isEdit };
}

export default useRoomForm;
