import { LinkWithIcon } from '@/components/ui/link';
import { Hotel } from 'lucide-react';

const EmptyHotels = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 border rounded-md">
      <div>
        <Hotel size={60} />
      </div>
      <div className="flex flex-col items-center justify-center max-w-lg gap-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="text-xl font-bold leading-none">
            No Hotels Added Yet
          </h2>
          <p className="text-base text-center text-muted-foreground">
            Create a new hotel to start managing rooms, bookings, and
            availability.
          </p>
        </div>
        <LinkWithIcon
          to={'/admin/hotels/create'}
          icon="plus"
          size="sm"
          className="gap-1"
        >
          Create Hotel
        </LinkWithIcon>
      </div>
    </div>
  );
};

export default EmptyHotels;
