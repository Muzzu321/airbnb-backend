import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import React, { useState } from 'react';
import AddNewTraveler from './add-new-traveler-dialog';
import GuestPicker from './guests-picker';
import TravelerContextProvider from '@/lib/providers/travelers-context';

const AddGuestsDialog = ({ bookingId, onBookingChange, bookingGuests }) => {
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

  return (
    <AlertDialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="link"
          aria-label="Add Guests"
          className="h-auto gap-1 p-0 text-xs font-semibold transition-opacity hover:opacity-80 hover:no-underline"
        >
          <Icon icon="plus" />
          <span>Add Guests</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <TravelerContextProvider>
          <AlertDialogHeader className={"flex flex-row items-center justify-between"}>
            <AlertDialogTitle className={"font-bold"}>Add Guest</AlertDialogTitle>
            <AddNewTraveler />
          </AlertDialogHeader>
          <GuestPicker
            onBookingChange={onBookingChange}
            setIsGuestDialogOpen={setIsGuestDialogOpen}
            bookingId={bookingId}
            bookingGuests={bookingGuests || []}
          />
        </TravelerContextProvider>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddGuestsDialog;
