import { ButtonWithIcon } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import TokenInput from '@/components/ui/token-input';
import PhotoUrlInput from '@/components/photo-url-input';
import useRoomForm from './use-room-form';

const digitsOnly = (value) => value.replace(/\D+/g, '');
const decimalOnly = (value) => value.replace(/[^0-9.]/g, '');

const RoomForm = ({ room }) => {
  const { form, submitHandler, pending, isEdit } = useRoomForm(room);
  return (
    <section>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitHandler)}
          className="space-y-6 max-w-[568px]"
        >
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Room Type</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Base Price (per night, ₹)</FormLabel>
                <FormControl>
                  <Input
                    inputMode="decimal"
                    {...field}
                    onChange={(e) => field.onChange(decimalOnly(e.target.value))}
                  />
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
            name="totalCount"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Total Room Count</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    {...field}
                    onChange={(e) => field.onChange(digitsOnly(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Capacity (guests per room)</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    {...field}
                    onChange={(e) => field.onChange(digitsOnly(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isEdit && (
            <p className="text-sm text-amber-700" role="note">
              Changing the base price or total room count does not rewrite
              inventory that was already generated for the hotel. Use Manage
              Inventory to adjust availability for specific dates.
            </p>
          )}
          <ButtonWithIcon
            icon="save"
            className="px-8 h-11"
            disabled={pending}
            isLoading={pending}
          >
            {isEdit ? 'Save Changes' : 'Create New Room'}
          </ButtonWithIcon>
        </form>
      </Form>
    </section>
  );
};

export default RoomForm;
