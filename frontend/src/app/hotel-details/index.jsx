import React from 'react';
import PropertyViewCarousel from './property-view-carousel';
import HotelMetaDetails from './hotel-meta-details';
import HotelRoomPicker from './hotel-rooms-picker';
import { HotelCheckoutCard } from './hotel-checkout-card';
import useGetHotelInfo from './hooks/use-get-hotel-details';
import { LoadingSpinner } from '@/components/ui/loader';
import ApiError from '@/components/api-error';

const HotelDetails = () => {
  const { data: hotelData, pending, error, errorInfo } = useGetHotelInfo();

  if (pending)
    return <LoadingSpinner containerClassName={'min-h-[calc(100vh-200px)]'} />;

  if (error || !hotelData?.hotel) {
    return (
      <ApiError
        errorName={errorInfo?.status === 404 ? 'Hotel not found' : 'Could not load this hotel'}
        errorMessage={error}
        className="h-[calc(100vh-300px)]"
      />
    );
  }

  const rooms = hotelData.rooms || [];

  return (
    <div className="container mt-6 mb-12">
      <PropertyViewCarousel images={hotelData.hotel.photos || []} />
      <div className="flex gap-6 mt-6">
        <div className="flex-1 space-y-8">
          <HotelMetaDetails hotel={hotelData.hotel} />
          <HotelRoomPicker rooms={rooms} />
        </div>
        <aside className="w-[340px] shrink-0 p-4 border border-border shadow-md rounded-xl sticky top-6 h-min">
          <HotelCheckoutCard rooms={rooms} />
        </aside>
      </div>
    </div>
  );
};

export default HotelDetails;
