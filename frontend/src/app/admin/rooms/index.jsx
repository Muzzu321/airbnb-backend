import React from 'react';
import EmptyRooms from './empty-rooms';
import useQuery from '@/lib/hooks/useQuery';
import { useParams } from 'react-router';
import { LoadingSpinner } from '@/components/ui/loader';
import { LinkWithIcon } from '@/components/ui/link';
import { useAdminContext } from '@/lib/providers/admin-context-provider';
import AdminHotelRoomCard from './admin-hotel-room-card';
import ApiError from '@/components/api-error';
import API_CONFIG from '@/config/api.config';

const Rooms = () => {
  const { hotel } = useAdminContext();
  const { hotelId } = useParams();
  const { data, pending, error, refetchQuery } = useQuery({
    url: API_CONFIG.ADMIN.ROOMS(hotelId),
  });

  if (pending) {
    return <LoadingSpinner containerClassName="min-h-[calc(100vh-56px)]" />;
  }

  if (error || !Array.isArray(data)) {
    return <ApiError errorMessage={error} />;
  }

  return (
    <div className="container p-4 max-w-[1536px] space-y-8">
      <section className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-base font-semibold">All Rooms</h1>
          <p className="text-sm">Manage Rooms in {hotel.name}</p>
        </div>
        {data.length > 0 && (
          <LinkWithIcon
            to={`/admin/hotels/${hotelId}/rooms/create`}
            icon="plus"
            size="sm"
            className="gap-1"
          >
            Create Room
          </LinkWithIcon>
        )}
      </section>
      {data.length === 0 ? (
        <EmptyRooms />
      ) : (
        <section className='space-y-4'>
          {data.map((room) => (
            <AdminHotelRoomCard
              key={room.id}
              {...room}
              refetchHotelRooms={refetchQuery}
            />
          ))}
        </section>
      )}
    </div>
  );
};

export default Rooms;
