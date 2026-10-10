import { Form } from '@/components/ui/form';
import React from 'react';
import useConfirmCheckout from './hooks/use-confirm-checkout';
import DateSelectInput from '@/features/search/date-select-input';
import OccupancyInput from '@/features/search/occupancy-input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { isRoomBookable } from './hooks/use-selected-room';

const CheckoutSummary = ({ selectedRoomDetails }) => {
  const { selectedRoom, estimatedTotal, billedDays, roomsCount } = selectedRoomDetails;
  const bookable = isRoomBookable(selectedRoom);
  const { form, handleUpdateDetailsFormSubmit, handleCheckoutConfirm } =
    useConfirmCheckout(selectedRoom?.id);

  return (
    <div className="space-y-4 ">
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(handleUpdateDetailsFormSubmit)}
        >
          <DateSelectInput form={form} />
          <OccupancyInput form={form} />

          {form.formState.isDirty && (
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="w-full"
              aria-label="Apply Changes"
            >
              Apply Changes
            </Button>
          )}
        </form>
      </Form>
      {bookable && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm">Estimated total</span>
            <span className="text-sm font-bold">{formatCurrency(estimatedTotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {`${formatCurrency(Math.round(selectedRoom.price))} avg/night × ${roomsCount} ${roomsCount === 1 ? 'room' : 'rooms'} × ${billedDays} billed days. The final amount is confirmed when you start the booking.`}
          </p>
        </div>
      )}

      <Button
        onClick={handleCheckoutConfirm}
        disabled={!bookable || form.formState.isDirty}
        className="w-full h-12 text-base font-semibold"
        aria-label="Continue to Book"
      >
        Continue to Book
      </Button>
      {form.formState.isDirty && (
        <p className="text-xs text-muted-foreground">Apply your changes to continue.</p>
      )}
    </div>
  );
};

export default CheckoutSummary;
