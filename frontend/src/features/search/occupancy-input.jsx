import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import Icon from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import React from 'react';
import { MAX_ROOMS_PER_BOOKING } from '@/config/app.config';

const OccupancyInput = ({ form }) => {
  const rooms = form.watch('roomsCount');
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="h-full px-4 py-2 rounded bg-background border-border min-w-60 flex-auto flex items-center justify-between"
          role="button"
        >
          <div className="flex items-center gap-2">
            <Icon
              icon="user"
              size="24"
              className="text-muted-foreground shrink-0"
            />
            <p className="text-sm">{rooms} {rooms === 1 ? 'room' : 'rooms'}</p>
          </div>
          <Icon
            icon="dropdown"
            size="18"
            className="text-muted-foreground shrink-0"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        sideOffset="1"
        align='start'
        className="p-4 w-80"
      >
        <FormField
          control={form.control}
          name="roomsCount"
          render={({ field }) => (
            <div>
              <FormItem className="flex items-center justify-between">
                <FormLabel>Rooms</FormLabel>
                <FormControl>
                  <div className='border rounded border-foreground/50 flex items-center'>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-10 text-primary hover:text-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        field.onChange(Math.max(field.value - 1, 1));
                      }}
                    >
                      <Icon icon="minus" />
                    </Button>
                    <span>{field.value}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-10 text-primary hover:text-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        field.onChange(Math.min(field.value + 1, MAX_ROOMS_PER_BOOKING));
                      }}
                    >
                      <Icon icon="plus" />
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            </div>
          )}
        />
      </PopoverContent>
    </Popover>
  );
};

export default OccupancyInput;
