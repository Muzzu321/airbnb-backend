import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PATHS } from '@/config/path.config';
import React from 'react';
import { Link } from 'react-router';
import { useSignUpForm } from './hooks/use-sign-up-form';

const SignUp = () => {

  const { form, handleSignUpSubmit, pending } = useSignUpForm();

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSignUpSubmit)}
          className="w-full mt-8 space-y-5"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} className="h-10 rounded" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} className="h-10 rounded" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} className="h-10 rounded" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-10"
            aria-label="Create a new Account"
            disabled={pending}
          >
            Create New Account
          </Button>
        </form>
      </Form>
      <div className="flex items-center justify-center mt-6">
        <span className="text-sm ">
          Already have an account?{' '}
          <Link to={PATHS.SIGN_IN} className="text-primary hover:underline">
            Sign in
          </Link>
        </span>
      </div>
    </>
  );
};

export default SignUp;
