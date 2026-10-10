import { Separator } from '@/components/ui/separator';
import React from 'react';
import CoTravellerInfo from './travellers-card';
import AddNewTraveler from '@/app/checkout/guests/add-new-traveler-dialog';
import TravelerContextProvider, {
  useTravelerContext,
} from '@/lib/providers/travelers-context';
import ApiError from '@/components/api-error';
import { LoadingSpinner } from '@/components/ui/loader';

const TravelersManagement = () => {
  const { travelers, pending, error } = useTravelerContext();

   if (error) {
     return <ApiError errorMessage={error} className="h-[calc(100vh-200px)]" />;
   }

   if (pending)
     return <LoadingSpinner containerClassName={'min-h-[calc(100vh-200px)]'} />;

  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold">Co-Travellers</h1>
          <p className="text-muted-foreground">
            Add, Remove or Update your travellers list
          </p>
        </div>
        <AddNewTraveler />
      </div>
      <Separator className="mt-4 mb-6" />
      <div>
        {travelers.length === 0 && (
          <p className="py-10 text-center text-muted-foreground">
            No co-travellers saved yet. Add one to book faster.
          </p>
        )}
        {travelers.map((traveler) => (
          <CoTravellerInfo {...traveler} key={traveler.id} />
        ))}
      </div>
    </section>
  );
};

export default TravelersManagement;
