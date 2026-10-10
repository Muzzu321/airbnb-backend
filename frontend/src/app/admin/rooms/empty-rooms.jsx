import { LinkWithIcon } from '@/components/ui/link';
import React from 'react';
import { useParams } from 'react-router';

const EmptyRooms = () => {
  const { hotelId } = useParams();
  return (
    <div className="flex flex-col items-center justify-center m-12 gap-6 py-16 border rounded-md">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
          <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
          <path d="M12 4v6" />
          <path d="M2 18h20" />
        </svg>
      </div>
      <div className="flex flex-col items-center justify-center max-w-lg gap-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <h2 className="text-xl font-bold leading-none">No Rooms Added Yet</h2>
          <p className="text-base text-center text-muted-foreground">
            Start by adding a new room to manage bookings and availability.
          </p>
        </div>
        <LinkWithIcon
          to={`/admin/hotels/${hotelId}/rooms/create`}
          icon="plus"
          size="sm"
          className="gap-1"
        >
          Create Room
        </LinkWithIcon>
      </div>
    </div>
  );
};

export default EmptyRooms;
