import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { SEARCH_PARAMS_KEYS } from '@/config/app.config';
import { formatCurrency } from '@/lib/utils';
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { isRoomBookable } from './hooks/use-selected-room';

const Room = ({ id, type, amenities = [], price, isSelected, photos = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookable = isRoomBookable({ price });

  const roomSelectHandler = () => {
    searchParams.set(SEARCH_PARAMS_KEYS.SELECTED_ROOM, id);
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <article>
      {isSelected && (
        <div className="flex items-center gap-1 px-5 py-1 rounded-t-lg bg-brand">
          <Icon icon="star" size="12" className="fill-amber-500 stroke-transparent" />
          <p className="text-xs font-bold text-white uppercase">Selected Category</p>
        </div>
      )}
      <div className="flex border border-border p-4">
        <div className="flex-1 space-y-4">
          <div className="flex gap-2 items-center">
            <h3 className="text-lg font-semibold">{type}</h3>
            {isSelected && (
              <Icon size="26" icon="circleCheck" className="fill-green-600 text-white" />
            )}
          </div>
          {amenities.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {amenities.map((item, index) => (
                <li key={index} className="flex gap-2 items-center min-w-[180px]">
                  <Icon icon="check" size="18" className="text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {photos[0] && (
          <div className="w-[180px] h-[120px]">
            <img src={photos[0]} alt={type} className="object-cover size-full rounded-lg" />
          </div>
        )}
      </div>
      <div className="flex border-x border-b p-4 rounded-b-lg">
        <div className="flex-1 flex flex-col justify-center">
          {bookable ? (
            <>
              <span className="text-lg font-bold">{formatCurrency(Math.round(price))}</span>
              <span className="text-xs text-muted-foreground">avg. per night</span>
            </>
          ) : (
            <span className="text-sm font-medium text-destructive">
              Not available for every night of your stay
            </span>
          )}
        </div>
        <Button
          disabled={isSelected || !bookable}
          onClick={roomSelectHandler}
          variant="outline"
          size="lg"
          className={`cursor-pointer h-12 font-semibold gap-1 w-[180px] disabled:opacity-80 uppercase ${
            !isSelected && 'hover:text-destructive text-destructive'
          }`}
        >
          {isSelected && <Icon icon="circleCheck" className="fill-green-600 text-white" />}
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </div>
    </article>
  );
};

const HotelRoomPicker = ({ rooms }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRoomId = Number(searchParams.get(SEARCH_PARAMS_KEYS.SELECTED_ROOM));

  // Default to the first room that can actually be booked.
  useEffect(() => {
    const current = rooms.find((item) => item.id === selectedRoomId);
    if (!current || !isRoomBookable(current)) {
      const firstBookable = rooms.find(isRoomBookable);
      if (firstBookable) {
        searchParams.set(SEARCH_PARAMS_KEYS.SELECTED_ROOM, firstBookable.id);
        setSearchParams(searchParams, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Choose your room</h2>
      {rooms.length === 0 ? (
        <div className="p-6 text-sm border rounded-lg text-muted-foreground">
          No rooms are available for these dates and room count. Try changing your dates.
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map((room) => (
            <Room {...room} key={room.id} isSelected={selectedRoomId === room.id} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HotelRoomPicker;
