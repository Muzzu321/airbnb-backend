import React from 'react';
import { useParams } from 'react-router';
import BackNavigation from '@/components/back-navigate';
import ApiError from '@/components/api-error';
import { LoadingSpinner } from '@/components/ui/loader';
import API_CONFIG from '@/config/api.config';
import useQuery from '@/lib/hooks/useQuery';
import RoomForm from '../room-form/room-form';

const EditRoom = () => {
  const { hotelId, roomId } = useParams();
  const { data, pending, error } = useQuery({
    url: API_CONFIG.ADMIN.ROOM(hotelId, roomId),
  });

  if (pending) {
    return <LoadingSpinner containerClassName="min-h-[calc(100vh-56px)]" />;
  }
  if (error || !data) return <ApiError errorMessage={error} />;

  return (
    <div className="container py-4 space-y-8">
      <BackNavigation
        href={`/admin/hotels/${hotelId}/rooms`}
        text="Back to rooms"
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Edit Room</h1>
        <p className="text-sm text-muted-foreground">
          Update the details of {data.type}
        </p>
      </div>
      <RoomForm key={data.id} room={data} />
    </div>
  );
};

export default EditRoom;
