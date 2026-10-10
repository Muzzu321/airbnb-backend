import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import dayjs from 'dayjs';
import React from 'react';
import { getDefaultProfile } from '@/lib/utils';
import RemoveTraveller from './remove-traveller';
import useUpdateGuestInfo from './use-update-guest';
import AddOrUpdateTravelerDialog from '@/features/travelers/traveler-dialog';
import { useTravelerContext } from '@/lib/providers/travelers-context';
import Icon from '@/components/ui/icon';

const CoTravellerInfo = ({ name, dateOfBirth, gender, id }) => {
  const { setTravelers } = useTravelerContext();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = React.useState(false);
  const { updateGuestInfo, pending } = useUpdateGuestInfo({
    guestId: id,
    setIsUpdateDialogOpen,
    onGuestInfoUpdate: (data) => {
      setTravelers((prevTravellers) => {
        return prevTravellers.map((traveller) => {
          if (traveller.id === id) {
            return {
              ...traveller,
              ...data,
            };
          }
          return traveller;
        });
      });
    },
  });
  const details = [
    gender && gender.toLowerCase(),
    dateOfBirth && `${dayjs().diff(dateOfBirth, 'year')}Y`,
    dateOfBirth,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <div className="flex items-center justify-between gap-4 px-2 py-3 [&:not(:last-child)]:border-b">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage
            loading="lazy"
            src={getDefaultProfile((name || '?').charAt(0))}
            width={36}
            height={36}
          />
          <AvatarFallback>{name && name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-base font-semibold">{name}</h3>
          <p className="text-sm font-medium capitalize text-muted-foreground">
            {details}
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8"
            aria-label="Manage Co-traveller"
          >
            <Icon icon="more" size="16" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              setIsUpdateDialogOpen(true);
            }}
          >
            Edit Traveller Info
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/20"
            onClick={() => {
              setIsRemoveDialogOpen(true);
            }}
          >
            Remove Traveller
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddOrUpdateTravelerDialog
        mutate={updateGuestInfo}
        title="Edit Traveller Information"
        description="Edit the details of the traveler"
        submitButtonText="Save Changes"
        isDialogOpen={isUpdateDialogOpen}
        setIsDialogOpen={setIsUpdateDialogOpen}
        formInitialData={{
          name,
          dateOfBirth: dateOfBirth ? dateOfBirth.split('-').join('') : null,
          gender,
        }}
        isDisabled={pending}
        isLoading={pending}
      />
      <RemoveTraveller
        id={id}
        isDialogOpen={isRemoveDialogOpen}
        setIsDialogOpen={setIsRemoveDialogOpen}
      />
    </div>
  );
};

export default CoTravellerInfo;
