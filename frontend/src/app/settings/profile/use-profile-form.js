import API_CONFIG from '@/config/api.config';
import useMutation from '@/lib/hooks/useMutation';
import { useAuthContext } from '@/lib/providers/auth-context-provider';
import { travellerSchema } from '@/lib/validators/traveler-validator';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { describeError } from '@/lib/api-error';

const EditProfileSchema = travellerSchema
  .pick({ name: true, dateOfBirth: true, gender: true })
  .partial({ dateOfBirth: true, gender: true });

function useProfileForm() {
  const { mutate, pending } = useMutation(API_CONFIG.USER.PROFILE, 'PATCH');
  const { authenticatedUser, setAuthenticatedUser } = useAuthContext();
  const user = authenticatedUser.user;

  const form = useForm({
    resolver: zodResolver(EditProfileSchema),
    defaultValues: {
      name: user.name ?? '',
      email: user.email ?? '',
      dateOfBirth: user.dateOfBirth
        ? dayjs(user.dateOfBirth).format('YYYYMMDD')
        : undefined,
      gender: user.gender ?? undefined,
    },
  });

  const updateProfileHandler = async (data) => {
    await mutate(data, {
      onSuccess: () => {
        setAuthenticatedUser((prev) => ({
          ...prev,
          user: { ...prev.user, ...data },
        }));
        toast('Profile updated successfully', {
          type: 'success',
        });
      },
      onError: (err) => {
        toast('Could not update profile', {
          description: describeError(err),
          type: 'error',
        });
      },
    });
  };

  return { form, updateProfileHandler, pending };
}

export default useProfileForm;
