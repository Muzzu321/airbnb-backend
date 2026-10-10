import API_CONFIG from '@/config/api.config';
import { PATHS } from '@/config/path.config';
import useMutation from '@/lib/hooks/useMutation';
import { signInSchema } from '@/lib/validators/auth-form-validator';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { AUTH_TOKEN_KEY, setStorageItem } from '@/lib/storage-manager';
import { useAuthContext } from '@/lib/providers/auth-context-provider';
import { SEARCH_PARAMS_KEYS } from '@/config/app.config';
import { describeError } from '@/lib/api-error';
import { getSafeRedirect } from '@/lib/utils';

const useSignInForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = getSafeRedirect(searchParams.get(SEARCH_PARAMS_KEYS.NEXT_REDIRECT));
  const { refetchCurrentUser } = useAuthContext();

  const { pending, mutate } = useMutation(API_CONFIG.AUTH.SIGN_IN, 'POST');

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function handleSignInSubmit(data) {
    mutate(data, {
      onSuccess: async (response) => {
        setStorageItem(AUTH_TOKEN_KEY, response.data.accessToken);
        const user = await refetchCurrentUser();
        if (!user) {
          toast('Signed in, but your profile could not be loaded', {
            description: 'Please try again.',
            type: 'error',
          });
          return;
        }
        toast('Logged in successfully', { type: 'success' });
        navigate(next || PATHS.LANDING, { replace: true });
      },
      onError: (err) => {
        toast(
          err.status === 401 ? 'Invalid email or password' : 'Could not sign in',
          { description: err.status === 401 ? undefined : describeError(err), type: 'error' }
        );
      },
    });
  }

  return { form, handleSignInSubmit, pending };
};

export { useSignInForm };
