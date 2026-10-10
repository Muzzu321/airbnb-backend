import API_CONFIG from '@/config/api.config';
import { describeError } from '@/lib/api-error';
import { useAdminContext } from '@/lib/providers/admin-context-provider';
import useMutation from '@/lib/hooks/useMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

const CreateHotelSchema = z.object({
  name: z.string().min(1, 'Hotel Name is required'),
  city: z.string().min(1, 'City is required'),
  photos: z.array(z.string().url('Photo must be a valid URL')),
  amenities: z.array(z.string()).nonempty('Amenities are required'),
  address: z.string().min(1, 'Address is required'),
  location: z.string().min(1, 'Location is required'),
  phoneNumber: z.string().min(1, 'Contact Number is required'),
  email: z.string().email('Email is invalid'),
});

export default function useEditHotelForm(hotel) {
  const { hotelId } = useParams();
  const { mutate, pending } = useMutation(API_CONFIG.ADMIN.HOTEL(hotelId), 'PUT');
  const { refetchHotel } = useAdminContext();

  const form = useForm({
    resolver: zodResolver(CreateHotelSchema),
    defaultValues: {
      name: hotel.name,
      city: hotel.city,
      photos: hotel.photos ?? [],
      amenities: hotel.amenities ?? [],
      address: hotel.contactInfo?.address ?? '',
      location: hotel.contactInfo?.location ?? '',
      phoneNumber: hotel.contactInfo?.phoneNumber ?? '',
      email: hotel.contactInfo?.email ?? '',
    },
  });

  const updateHotelHandler = (data) => {
    const apiBody = {
      name: data.name,
      city: data.city,
      photos: data.photos,
      amenities: data.amenities,
      contactInfo: {
        address: data.address,
        phoneNumber: data.phoneNumber,
        email: data.email,
        location: data.location,
      },
      active: hotel.active,
    };

    mutate(apiBody, {
      onSuccess: () => {
        toast('Hotel details updated successfully', {
          type: 'success',
        });
        refetchHotel();
      },
      onError: (error) => {
        toast('Could not update hotel', {
          description: describeError(error),
          type: 'error',
        });
      },
    });
  };

  return { form, pending, updateHotelHandler };
}
