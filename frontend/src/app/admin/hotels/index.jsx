import useQuery from '@/lib/hooks/useQuery';
import React from 'react';
import EmptyHotels from './empty-hotels';
import { LinkWithIcon } from '@/components/ui/link';
import { LoadingSpinner } from '@/components/ui/loader';
import ApiError from '@/components/api-error';
import API_CONFIG from '@/config/api.config';
import { Badge } from '@/components/ui/badge';

const HotelCard = ({ photos, name, contactInfo, id, active }) => {
  return (
    <article className="overflow-hidden border rounded-xl">
      <div>
        {photos?.[0] ? (
          <img
            height="200"
            className="object-cover w-full h-52"
            src={photos[0]}
            alt={name}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-52 bg-secondary text-muted-foreground text-sm">
            No photo
          </div>
        )}
      </div>
      <div className="p-2 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{name}</h2>
            <Badge variant="outline">{active ? 'Active' : 'Inactive'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {contactInfo?.address}
          </p>
        </div>
        <LinkWithIcon
          to={`/admin/hotels/${id}/overview`}
          icon="rightArrow"
          className="flex-row-reverse justify-center w-full rounded-full"
        >
          Go to Dashboard
        </LinkWithIcon>
      </div>
    </article>
  );
};

const Hotels = () => {
  const { data, pending, error } = useQuery({ url: API_CONFIG.ADMIN.HOTELS });

  if (pending)
    return <LoadingSpinner containerClassName={'min-h-[calc(100vh-120px)]'} />;

  if (error || !Array.isArray(data)) return <ApiError errorMessage={error} />;

  return (
    <div className="container">
      {data.length === 0 && <EmptyHotels />}
      {data.length > 0 && (
        <>
          <section className="flex items-center justify-between mt-8">
            <div>
              <h1 className="font-semibold text-2xl">Your Hotels</h1>
              <p className="text-muted-foreground">
                Manage all your hotels in one place
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
          </section>
          <section className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mt-8">
            {data.map((hotel) => (
              <HotelCard key={hotel.id} {...hotel} />
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default Hotels;
