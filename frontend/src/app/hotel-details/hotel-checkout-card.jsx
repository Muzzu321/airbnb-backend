import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import Icon from '@/components/ui/icon';
import React from 'react';
import useGetSelectedRoomDetails, { isRoomBookable } from './hooks/use-selected-room';
import CheckoutSummary from './checkout-summary';
import { formatCurrency } from '@/lib/utils';

// Describes what the backend actually does (BookingServiceImpl): only CONFIRMED bookings can be cancelled
// and the Stripe payment is refunded in full; rooms are held 10 minutes during checkout.
const POLICY_POINTS = [
  'Rooms are held for 10 minutes while you complete the booking.',
  'A confirmed booking can be cancelled from My Bookings; the full payment is refunded to the original payment method.',
];

const CancellationPolicy = () => {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger>
        <div className="flex gap-2 text-rose-600 items-center cursor-pointer">
          <span className="text-sm font-medium">Booking &amp; cancellation</span>
          <Icon icon="info" size="16" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        side="left"
        className="w-[350px] space-y-3 border-border"
      >
        <h3 className="text-base font-semibold">Booking &amp; cancellation</h3>
        <ul className="pl-4 space-y-3 list-disc">
          {POLICY_POINTS.map((policy) => (
            <li key={policy} className="text-sm leading-relaxed font-medium text-accent-foreground">
              {policy}
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
};

export const HotelCheckoutCard = ({ rooms }) => {
  const selectedRoomDetails = useGetSelectedRoomDetails(rooms);
  const room = selectedRoomDetails.selectedRoom;

  return (
    <div className="space-y-6">
      {room && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{room.type}</p>
          <p className="text-2xl font-bold">
            {isRoomBookable(room) ? formatCurrency(selectedRoomDetails.estimatedTotal) : 'Unavailable'}
          </p>
          {isRoomBookable(room) && <p className="text-xs text-muted-foreground">estimated total</p>}
        </div>
      )}

      <CheckoutSummary selectedRoomDetails={selectedRoomDetails} />

      <CancellationPolicy />
    </div>
  );
};
