import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import InputDOB from '@/components/ui/input-dob';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import useProfileForm from './use-profile-form';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const EditProfile = () => {
  const { form, updateProfileHandler, pending } = useProfileForm();
  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(updateProfileHandler)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
              <FormLabel className="inline-flex items-center gap-2">
                Email
                <div className="text-[10px] text-primary bg-blue-100 px-2 py-1 rounded-full">
                  Not Editable
                </div>
              </FormLabel>
              <FormControl>
                <Input readOnly {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex-1">
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
            <FormItem className="flex-1">
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
                        CustomNode={() => <Icon icon="male" size="20" />}
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
        <Button
          disabled={pending}
          size="lg"
          type="submit"
        >
          <Icon icon={"save"} />
          Save Changes
        </Button>
      </form>
    </Form>
  );
};

export default EditProfile;
