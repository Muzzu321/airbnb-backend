import React from 'react';
import useEditHotelForm from './use-edit-hotel';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ButtonWithIcon } from '@/components/ui/button';
import PhotoUrlInput from '@/components/photo-url-input';
import TokenInput from '@/components/ui/token-input';

const EditHotelForm = ({ data }) => {
  const { form, pending, updateHotelHandler } = useEditHotelForm(data);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(updateHotelHandler)}
        className="space-y-6 max-w-[568px]"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Hotel Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Photos (image URLs)</FormLabel>
              <FormControl>
                <PhotoUrlInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Amenities</FormLabel>
              <FormControl>
                <TokenInput {...field} placeholder="Type amenities here..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Hotel Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/[^0-9+]/g, ''))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <ButtonWithIcon
          icon="save"
          className="px-8 h-11"
          disabled={pending}
          isLoading={pending}
        >
          Save Changes
        </ButtonWithIcon>
      </form>
    </Form>
  );
};

export default EditHotelForm;
