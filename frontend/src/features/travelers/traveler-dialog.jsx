import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import InputDOB from '@/components/ui/input-dob';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { travellerSchema } from '@/lib/validators/traveler-validator';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import React from 'react';
import { useForm } from 'react-hook-form';

const AddUpdateTravellerForm = ({
  formInitialData,
  mutate,
  isLoading = false,
  isDisabled = false,
  submitButtonText,
}) => {
  const form = useForm({
    resolver: zodResolver(travellerSchema),
    defaultValues: {
      name: formInitialData.name || '',
      dateOfBirth: formInitialData.dateOfBirth
        ? dayjs(formInitialData.dateOfBirth).format('YYYYMMDD')
        : '',
      gender: formInitialData.gender || '',
    },
  });

  function onSubmit(data) {
    if (mutate && typeof mutate === 'function') {
      mutate(data);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (as per Govt. ID)</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <InputDOB {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-3"
                >
                  <FormItem className="flex items-center px-4 rounded-md border h-10 space-x-1 [&:has([aria-checked=true])]:bg-blue-50 cursor-pointer [&:has([aria-checked=true])]:border-primary space-y-0">
                    <FormControl>
                      <RadioGroupItem
                        value="MALE"
                        className="w-auto h-auto border-0 rounded-none"
                        CustomNode={() => <Icon icon={'male'} size={20} />}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Male</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center px-4 rounded-md border h-10 space-x-1 [&:has([aria-checked=true])]:bg-pink-50 cursor-pointer [&:has([aria-checked=true])]:border-pink-500 space-y-0">
                    <FormControl>
                      <RadioGroupItem
                        value="FEMALE"
                        className="w-auto h-auto text-pink-400 border-0 rounded-none"
                        CustomNode={() => <Icon icon="female" size="20" />}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Female</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDisabled}>Discard</AlertDialogCancel>
          <Button
            type="submit"
            aria-label={submitButtonText}
            isLoading={isLoading}
            disabled={isDisabled}
          >
            {submitButtonText}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
};

const AddOrUpdateTravelerDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  TriggerNode,
  title,
  description,
  submitButtonText,
  formInitialData = {},
  mutate,
  isLoading,
  isDisabled,
}) => {
  return (
    <AlertDialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
      {TriggerNode && (
        <AlertDialogTrigger asChild>{TriggerNode}</AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AddUpdateTravellerForm
          submitButtonText={submitButtonText}
          formInitialData={formInitialData}
          mutate={mutate}
          isLoading={isLoading}
          isDisabled={isDisabled}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddOrUpdateTravelerDialog;
