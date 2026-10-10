import ApiError from '@/components/api-error';
import BackNavigation from '@/components/back-navigate';
import { LoadingSpinner } from '@/components/ui/loader';
import useQuery from '@/lib/hooks/useQuery';
import React from 'react';
import API_CONFIG from '@/config/api.config';
import { useParams } from 'react-router';
import AdminHotelRoomCard from '../rooms/admin-hotel-room-card';
import UpdateInventory from './update-inventory';
import InventoryTable from './inventory-table';

const Inventory = () => {
  const { hotelId, roomId } = useParams();
  const { data, pending, error } = useQuery({
    url: API_CONFIG.ADMIN.ROOM(hotelId, roomId),
  });
  const {
    data: inventories,
    pending: inventoryLoading,
    error: inventoryError,
    refetchQuery: inventoriesRefetch,
  } = useQuery({
    url: API_CONFIG.ADMIN.INVENTORY(roomId),
  });
  if (pending) {
    return <LoadingSpinner containerClassName="min-h-[calc(100vh-56px)]" />;
  }
  if (error || !data) {
    return (
      <ApiError errorMessage={error} className="h-[calc(100vh-56px)]" />
    );
  }

  return (
    <div className="container p-4 max-w-[1536px] space-y-8">
      <div className="space-y-4">
        <BackNavigation
          text="Back to Rooms"
          href={`/admin/hotels/${hotelId}/rooms`}
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold">Manage Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track room availability, occupancy, and details
            efficiently
          </p>
        </div>
        <AdminHotelRoomCard showRoomSettings={false} {...data} />
        <UpdateInventory inventoriesRefetch={inventoriesRefetch} />
        {inventoryError && (
          <p className="text-sm text-destructive" role="alert">
            {inventoryError}
          </p>
        )}
        <InventoryTable
          inventories={inventories ?? []}
          inventoryLoading={inventoryLoading}
        />
      </div>
    </div>
  );
};

export default Inventory;
