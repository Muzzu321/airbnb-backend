import useMutation from '@/lib/hooks/useMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import API_CONFIG from '@/config/api.config';
import { describeError } from '@/lib/api-error';
import { z } from 'zod';

const CreateHotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  city: z.string().min(1, 'City name is required'),
  photos: z.array(z.string().url('Photo must be a valid URL')),
  amenities: z.array(z.string()).nonempty('Amenities are required'),
  address: z.string().min(1, 'Address is required'),
  location: z.string().min(1, 'Location is required'),
  phoneNumber: z.string().min(1, 'Contact Number is required'),
  email: z.string().email('Email is invalid'),
});

export function useCreateHotelForm() {
  const navigate = useNavigate();
  const { mutate, pending } = useMutation(API_CONFIG.ADMIN.HOTELS, 'POST');
  const form = useForm({
    resolver: zodResolver(CreateHotelSchema),
    defaultValues: {
      name: '',
      city: '',
      photos: [],
      amenities: [],
      address: '',
      location: '',
      phoneNumber: '',
      email: '',
    },
  });

  const createHotelHandler = (data) => {
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
    };

    mutate(apiBody, {
      onSuccess: (response) => {
        toast('Hotel created successfully', {
          type: 'success',
        });
        navigate(`/admin/hotels/${response.data.id}/overview`);
      },
      onError: (error) => {
        toast('Could not create hotel', {
          description: describeError(error),
          type: 'error',
        });
      },
    });
  };

  return { form, createHotelHandler, pending };
}
