import Icon from '@/components/ui/icon';
import React from 'react';
import useHotelNavigation from '../hooks/use-hotel-navigation';
import { Link } from 'react-router';
import { formatCurrency } from '@/lib/utils';

const HotelImages = ({ photos = [], name }) => {
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center w-60 h-[138px] rounded-sm bg-secondary text-xs text-muted-foreground">
        No photos
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="w-60">
        <img
          height={138}
          width={240}
          className="rounded-sm max-h-[138px] w-full object-cover"
          src={photos[activeImageIndex]}
          alt={name}
        />
      </div>
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-1 w-60">
          {photos.slice(1, 5).map((image, index) => (
            <div className="relative overflow-hidden rounded-sm" key={index}>
              <img
                height={50}
                width={60}
                className="h-12 w-full object-cover"
                src={image}
                alt={`${name} photo ${index + 2}`}
                onMouseEnter={() => setActiveImageIndex(index + 1)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HotelCard = ({ name, photos, city, id, amenities = [], price, contactInfo }) => {
  const navigationUrl = useHotelNavigation(id);
  return (
    <Link className="block" to={navigationUrl}>
      <article className="flex w-full transition-colors border rounded-lg hover:border-primary">
        <div className="flex flex-1 gap-4 p-4">
          <HotelImages photos={photos || []} name={name} />
          <div className="space-y-3">
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-sm font-semibold text-primary">{city}</p>
              {contactInfo?.address && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {contactInfo.address}
                </p>
              )}
            </div>
            {amenities.length > 0 && (
              <ul className="space-y-1">
                {amenities.slice(0, 3).map((amenity, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-1 text-sm text-green-700"
                  >
                    <Icon icon="check" size="16" />
                    {amenity}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end justify-end w-48 p-4 border-l shrink-0">
          <p className="text-sm text-muted-foreground">Starting from</p>
          <p className="text-2xl font-bold">{formatCurrency(Math.round(price))}</p>
          <p className="text-sm text-muted-foreground">per night (avg. for your dates)</p>
          <span className="mt-2 text-xs font-medium text-primary">View rooms</span>
        </div>
      </article>
    </Link>
  );
};

export default React.memo(HotelCard);
