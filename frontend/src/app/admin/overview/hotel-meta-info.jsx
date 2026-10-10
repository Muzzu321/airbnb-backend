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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import API_CONFIG from '@/config/api.config';
import { describeError } from '@/lib/api-error';
import { useAdminContext } from '@/lib/providers/admin-context-provider';
import { PATHS } from '@/config/path.config';
import useMutation from '@/lib/hooks/useMutation';
import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';


const DeleteHotelConfirmationDialog = ({ openDialog, setOpenDialog }) => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const { mutate, pending } = useMutation(API_CONFIG.ADMIN.HOTEL(hotelId), 'DELETE');
  const deleteHotelHandler = React.useCallback(() => {
    mutate(null, {
      onSuccess: () => {
        setOpenDialog(false);
        navigate(PATHS.ADMIN.LIST_HOTELS);
      },
      onError: (error) => {
        toast('Could not delete hotel', {
          description: describeError(error),
          type: 'error',
        });
      },
    });
  }, [mutate, navigate, setOpenDialog]);

  return (
    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this hotel?</AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">
            Are you sure you want to delete this hotel? This action cannot be
            undone. A hotel that already has bookings cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={deleteHotelHandler}
            disabled={pending}
          >
            Yes, Delete My Hotel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const HotelSettings = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const openDeleteConfirmationDialog = React.useCallback(() => {
    setOpenDialog(true);
    setDropdownOpen(false);
  }, [setDropdownOpen, setOpenDialog]);
  return (
    <React.Fragment>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="w-8 h-8" variant="ghost">
            <Icon icon="more" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigate(`/admin/hotels/${hotelId}/edit`)}
          >
            Edit Hotel Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={openDeleteConfirmationDialog}
            className="text-destructive focus:text-destructive"
          >
            Delete Hotel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteHotelConfirmationDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
    </React.Fragment>
  );
};

const ActivateHotel = () => {
  const { hotelId } = useParams();
  const { refetchHotel } = useAdminContext();
  const [open, setOpen] = React.useState(false);
  const { mutate, pending } = useMutation(
    API_CONFIG.ADMIN.ACTIVATE_HOTEL(hotelId),
    'PATCH'
  );

  const activate = () =>
    mutate(null, {
      onSuccess: () => {
        toast('Hotel activated. It is now searchable.', { type: 'success' });
        setOpen(false);
        refetchHotel();
      },
      onError: (error) => {
        toast('Could not activate hotel', {
          description: describeError(error),
          type: 'error',
        });
      },
    });

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Activate hotel
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate this hotel?</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              Activating generates one year of room inventory for the rooms that
              exist now and makes the hotel visible in search. Rooms you add
              later are initialised automatically. This can only be done once.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button onClick={activate} disabled={pending} isLoading={pending}>
              Activate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const HotelMetaInfo = ({ name, address, photo, active }) => {
  return (
    <article className="flex items-center justify-between p-4 border rounded-md">
      <div className="flex gap-4">
        {photo ? (
          <img
            src={photo}
            alt={name}
            width={150}
            height={100}
            className="rounded-md"
          />
        ) : (
          <div className="flex items-center justify-center w-[150px] h-[100px] rounded-md bg-secondary text-sm text-muted-foreground">
            No photo
          </div>
        )}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold leading-none">{name}</h2>
              <Badge variant="outline">{active ? 'Active' : 'Inactive'}</Badge>
            </div>
            <p className="text-muted-foreground">{address}</p>
            {!active && (
              <p className="text-sm text-amber-700">
                This hotel is not visible to guests until it is activated.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!active && <ActivateHotel />}
        <HotelSettings />
      </div>
    </article>
  );
};

export default HotelMetaInfo;
