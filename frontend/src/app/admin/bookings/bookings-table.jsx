import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { topBookingTableHeader } from '@/config/admin.config';
import { bookingStatusVariant } from '@/config/app.config';
import { cn, formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const MoreDetailsDialog = ({ sheetOpen, setSheetOpen, booking }) => {
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="sm:max-w-[500px] overflow-auto">
        <SheetHeader>
          <SheetTitle>Booking Details</SheetTitle>
          <SheetDescription className="sr-only">
            Complete breakdown of the booking.
          </SheetDescription>
        </SheetHeader>

        {/* User Info */}
        <div className="mt-6 border rounded-md">
          <h3 className="font-semibold p-4 border-b">User Info</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{booking?.user?.name || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{booking?.user?.email || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gender</TableCell>
                <TableCell>{booking?.user?.gender || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Date of Birth</TableCell>
                <TableCell>
                  {booking?.user?.dateOfBirth
                    ? dayjs(booking.user.dateOfBirth).format('DD MMM YYYY')
                    : 'N/A'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Roles</TableCell>
                <TableCell>
                  {booking?.user?.roles?.join(', ') || 'N/A'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Booking Info */}
        <div className="mt-6 border rounded-md">
          <h3 className="font-semibold p-4 border-b">Booking Info</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>{booking?.id ?? 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Room Type</TableCell>
                <TableCell>{booking?.room?.type || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Rooms Count</TableCell>
                <TableCell>{booking?.roomsCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Check-in Date</TableCell>
                <TableCell>
                  {dayjs(booking?.checkInDate).format('DD MMM YYYY')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Check-out Date</TableCell>
                <TableCell>
                  {dayjs(booking?.checkOutDate).format('DD MMM YYYY')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>{booking?.bookingStatus}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>{formatCurrency(booking?.amount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Created At</TableCell>
                <TableCell>
                  {dayjs(booking?.createdAt).format('DD MMM YYYY, HH:mm')}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Updated At</TableCell>
                <TableCell>
                  {dayjs(booking?.updatedAt).format('DD MMM YYYY, HH:mm')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Guests Info */}
        {booking?.guests?.length > 0 && (
          <div className="mt-6 border rounded-md">
            <h3 className="font-semibold p-4 border-b">Guests</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>DOB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {booking.guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>{guest.name}</TableCell>
                    <TableCell>{guest.gender}</TableCell>
                    <TableCell>
                      {guest.dateOfBirth
                        ? dayjs(guest.dateOfBirth).format('DD MMM YYYY')
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};


const BookingsTable = ({ bookings }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetBooking, setSheetBooking] = useState(null);

  function handleSheetClick(booking) {
    setSheetBooking(booking);
    setSheetOpen(true);
  }

  return (
    <div className="overflow-hidden border rounded-md">
      <Table>
        <TableHeader className={'bg-muted/50'}>
          <TableRow>
            {topBookingTableHeader.map((header) => (
              <TableHead className={header.className} key={header.id}>
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 && (
            <TableRow className="pointer-events-none">
              <TableCell
                colSpan={topBookingTableHeader.length}
                className="h-32 text-center"
              >
                No bookings yet.
              </TableCell>
            </TableRow>
          )}
          {bookings.map((booking) => (
            <TableRow
              key={booking.id}
              tabIndex={0}
              className="cursor-pointer"
              onClick={() => handleSheetClick(booking)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSheetClick(booking);
                }
              }}
            >
              <TableCell>{booking.id}</TableCell>
              <TableCell>{booking.user?.name ?? 'N/A'}</TableCell>
              <TableCell>{booking.room?.type ?? 'N/A'}</TableCell>
              <TableCell>{booking.roomsCount}</TableCell>
              <TableCell>
                {dayjs(booking.checkInDate).format('DD MMM YYYY')}
              </TableCell>
              <TableCell>
                {dayjs(booking.checkOutDate).format('DD MMM YYYY')}
              </TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    'text-white px-2 py-1',
                    bookingStatusVariant[booking.bookingStatus]?.className
                  )}
                >
                  {bookingStatusVariant[booking.bookingStatus]?.text}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">{formatCurrency(booking.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <MoreDetailsDialog
        sheetOpen={sheetOpen}
        setSheetOpen={setSheetOpen}
        booking={sheetBooking}
      />
    </div>
  );
};

export default BookingsTable;
