import {z} from 'zod'

const signUpSchema = z.object({
  name: z
    .string()
    .nonempty('Please enter a valid name')
    .min(2, 'Name must be of at least 2 characters')
    .max(30, 'Name must be less than 30 characters long'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,30}$/, {
      message:
        'Password must be 8-30 characters with uppercase, lowercase, number, special character.',
    }),
});

// Sign-in must not re-apply the sign-up password policy (existing accounts may predate it).
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Please enter your password'),
});

export {signInSchema, signUpSchema};
