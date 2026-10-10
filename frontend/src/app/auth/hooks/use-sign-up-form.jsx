import API_CONFIG from '@/config/api.config';
import { PATHS } from '@/config/path.config';
import useMutation from '@/lib/hooks/useMutation';
import { signUpSchema } from '@/lib/validators/auth-form-validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { describeError } from '@/lib/api-error';

const useSignUpForm = () => {

  const navigate = useNavigate();

  const { pending, mutate } = useMutation(
    API_CONFIG.AUTH.SIGN_UP,
    'POST'
  );

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  function handleSignUpSubmit(data) {
    mutate(data, {
      onSuccess: () => {
        toast("Sign up successful", {
          description: "Use your credentials to sign in",
          type: "success"
        })
        navigate(PATHS.SIGN_IN);
      },
      onError: (err) => {
        toast(err.status === 409 ? 'Email already registered' : 'Could not create the account', {
          description: describeError(err),
          type: 'error',
        });
      },
    });
  }

  return { form, handleSignUpSubmit, pending };
};

export { useSignUpForm };
