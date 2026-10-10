import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { inventoryRoomStatus, roomInventoryTableHeader } from '@/config/admin.config'
import { cn, formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import React from 'react'

const InventoryTableLoadingSkeleton = () => {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="w-24 h-6 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-24 h-6 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-24 h-6 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-24 h-6 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-24 h-6 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-24 h-6 rounded-full" />
      </TableCell>
    </TableRow>
  );
};

const InventoryTable = ({inventories, inventoryLoading}) => {
  return (
    <div className="overflow-hidden border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {roomInventoryTableHeader.map((header) => (
              <TableHead className={header.className} key={header.id}>
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryLoading && (
            <>
              <InventoryTableLoadingSkeleton />
              <InventoryTableLoadingSkeleton />
              <InventoryTableLoadingSkeleton />
              <InventoryTableLoadingSkeleton />
            </>
          )}

          {!inventoryLoading && inventories.length === 0 && (
            <TableRow className="pointer-events-none">
              <TableCell
                colSpan={roomInventoryTableHeader.length}
                className="h-32 text-center"
              >
                No inventory have been made yet.
              </TableCell>
            </TableRow>
          )}
          {!inventoryLoading &&
            inventories.map((inventory) => (
              <TableRow key={inventory.id}>
                <TableCell>
                  {dayjs(inventory.date).format('DD MMM YYYY')}
                </TableCell>
                <TableCell>{inventory.bookedCount}</TableCell>
                <TableCell>{inventory.reservedCount}</TableCell>
                <TableCell>{inventory.surgeFactor}</TableCell>
                <TableCell className="font-mono">{formatCurrency(inventory.price)}</TableCell>
                <TableCell>
                  <div
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 font-medium capitalize rounded-md w-max',
                      inventoryRoomStatus[
                        inventory.closed ? 'inactive' : 'active'
                      ].className
                    )}
                  >
                    {
                      inventoryRoomStatus[
                        inventory.closed ? 'inactive' : 'active'
                      ].text
                    }
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default InventoryTable