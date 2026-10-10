import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import useRemoveGuest from './use-remove-guest';

const RemoveTraveller = ({ isDialogOpen, setIsDialogOpen, id }) => {
  const { removeGuest, pending } = useRemoveGuest({
    guestId: id,
    setIsDialogOpen,
  });

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Remove Traveller</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this traveller? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>No, Keep it</AlertDialogCancel>
          <Button
            isLoading={pending}
            disabled={pending}
            variant="destructive"
            onClick={removeGuest}
          >
            Yes, Remove Traveller
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveTraveller;
