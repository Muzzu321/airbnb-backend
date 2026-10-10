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
import { useSignInForm } from './hooks/use-sign-in-form';


const SingIn = () => {

  const {form, handleSignInSubmit, pending} = useSignInForm();

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSignInSubmit)}
          className="w-full mt-8 space-y-5"
        >
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
                  <div className="flex items-center justify-between">
                    <Input
                      type='password'
                      {...field}
                      className="h-10 rounded"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-10"
            aria-label="Login to your Account"
            disabled={pending}
          >
            Log in
          </Button>
        </form>
      </Form>
      <div className="flex items-center justify-center mt-6">
        <span className="text-sm ">
          Don&apos;t have an account?
          <Link to={PATHS.SIGN_UP} className="text-primary hover:underline">
            Create Account
          </Link>
        </span>
      </div>
    </>
  );
};

export default SingIn;
