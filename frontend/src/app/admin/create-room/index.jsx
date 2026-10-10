import BackNavigation from '@/components/back-navigate';
import React from 'react'
import { useParams } from 'react-router';
import RoomForm from '../room-form/room-form';

const CreateRoom = () => {

  const {hotelId} = useParams();

  return (
    <div className="container py-4 space-y-8">
      <BackNavigation href={`/admin/hotels/${hotelId}/rooms`} text="Back to rooms" />
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">Create Room</h1>
        <p className="text-sm text-muted-foreground">
          Fill room information to create new room
        </p>
      </div>
      <RoomForm />
    </div>
  );
}

export default CreateRoom