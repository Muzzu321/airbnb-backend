import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import React from 'react';

const DateSelectInput = ({ form, className, minDays = 2 }) => {
  return (
    <Popover>
      <FormField
        control={form.control}
        name="bookingDates"
        render={({ field }) => (
          <>
            <PopoverTrigger asChild>
              <FormItem
                className={cn(
                  'px-4 py-2 rounded bg-background h-full lg:min-w-[300px] lg:flex-auto',
                  className
                )}
              >
                <FormControl>
                  <div role="button" className="flex items-center h-full">
                    <Icon
                      icon="calendar"
                      size="24"
                      className="text-muted-foreground shrink-0"
                    />
                    <div className="flex items-center flex-1 gap-2 px-2">
                      <p className="text-sm">
                        {field?.value?.from
                          ? dayjs(field.value.from).format('ddd D MMM')
                          : 'Check-in date'}
                      </p>
                      <span aria-hidden>-</span>
                      <p className="text-sm">
                        {field?.value?.to
                          ? dayjs(field.value.to).format('ddd D MMM')
                          : 'Check-out date'}
                      </p>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            </PopoverTrigger>
            <PopoverContent
              sideOffset="1"
              align="start"
              className="w-[640px]"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Calendar
                required
                mode="range"
                min={minDays}
                selected={field.value}
                numberOfMonths={2}
                fromMonth={new Date()}
                disabled={(date) => dayjs().isAfter(dayjs(date), 'date')}
                onSelect={(value) => {
                  field.onChange(value);
                }}
              />
            </PopoverContent>
          </>
        )}
      />
    </Popover>
  );
};

export default DateSelectInput;
