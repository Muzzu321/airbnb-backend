import AddOrUpdateTravelerDialog from '@/features/travelers/traveler-dialog';
import React from 'react';
import useAddTraveler from '../hooks/use-add-traveler';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const AddNewTraveler = () => {
  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = React.useState(false);
  const { pending, addGuest } = useAddTraveler({ setIsAddGuestDialogOpen });

  return (
    <AddOrUpdateTravelerDialog
      mutate={addGuest}
      title={'Add New Traveler'}
      isDialogOpen={isAddGuestDialogOpen}
      setIsDialogOpen={setIsAddGuestDialogOpen}
      isDisabled={pending}
      isLoading={pending}
      submitButtonText={'Add To Travelers List'}
      TriggerNode={
        <Button
          size={'sm'}
          variant={'link'}
          className="h-auto gap-1 p-0 text-sm font-semibold transition-opacity hover:opacity-80 hover:no-underline"
        >
          <Icon icon={'plus'} size={16} />
          Add New Traveler
        </Button>
      }
    />
  );
};

export default AddNewTraveler;
