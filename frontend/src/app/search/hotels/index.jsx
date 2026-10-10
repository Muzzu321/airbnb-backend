import React from 'react';
import HotelCard from './components/hotel-card';
import HotelCardSkeleton from './components/hotel-card-skeleton';
import ApiError from '@/components/api-error';

const Message = ({ title, children }) => (
  <div className="py-16 text-center border rounded-lg">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="mt-1 text-sm text-muted-foreground">{children}</p>
  </div>
);

const Hotels = ({ isLoading, data, error, hasCity }) => {
  if (!hasCity) {
    return (
      <Message title="Where would you like to stay?">
        Enter a destination, your dates and the number of rooms above.
      </Message>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <HotelCardSkeleton />
        <HotelCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <ApiError
        errorName="Could not load hotels"
        errorMessage={error}
        className="h-auto py-16"
      />
    );
  }

  if (data.length === 0) {
    return (
      <Message title="No properties found">
        We could not find any hotels for this destination and these dates. Try different dates or another city.
      </Message>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((hotel) => (
        <HotelCard key={hotel.id} {...hotel} />
      ))}
    </div>
  );
};

export default Hotels;
