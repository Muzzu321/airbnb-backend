import BackNavigation from '@/components/back-navigate';
import React from 'react'
import { useParams } from 'react-router';
import EditHotelForm from './edit-hotel-form';
import { LoadingSpinner } from '@/components/ui/loader';
import { useAdminContext } from '@/lib/providers/admin-context-provider';

const EditHotel = () => {
  const {hotelId} = useParams();

  const {hotel, isLoading} = useAdminContext();

  if (isLoading) {
    return <LoadingSpinner containerClassName="min-h-[calc(100vh-56px)]" />;
  }

  return (
    <div className="container p-4 max-w-[1536px] space-y-8">
      <div className="space-y-4">
        <BackNavigation
          text="Back to hotel"
          href={`/admin/hotels/${hotelId}/overview`}
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold">Hotel Information</h1>
          <p className="text-sm text-muted-foreground">
            Modify hotel information and review it
          </p>
        </div>
      </div>

      <EditHotelForm key={hotel.id} data={hotel} />
    </div>
  );
}

export default EditHotel