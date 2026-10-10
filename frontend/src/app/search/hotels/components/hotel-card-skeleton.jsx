import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const HotelCardSkeleton = () => {
  return (
    <div className="flex w-full border-border border rounded-lg">
      <div className="flex flex-1 gap-4 p-4">
        <div className="flex flex-col gap-1">
          <div className="w-60">
            <Skeleton className="rounded-sm h-[138px] w-full" />
          </div>
          <div className="grid grid-cols-4 gap-1 w-60">
            {new Array(4).fill(0).map((_, index) => (
              <Skeleton className="rounded-sm h-[50px]" key={index} />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-full h-8 rounded-sm max-w-24" />
            <Skeleton className="w-full h-8 rounded-sm max-w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-full h-6 rounded-sm" />
            <Skeleton className="w-full h-3 rounded-sm" />
            <Skeleton className="w-full h-3 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-full h-8 rounded-sm max-w-24" />
            <Skeleton className="w-full h-8 rounded-sm max-w-24" />
          </div>
          <Skeleton className="w-full h-3 rounded-sm" />
          <Skeleton className="h-3 rounded-sm max-w-32" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-between w-48 p-4 border-l border-border bg-zinc-50 shrink-0">
        <Skeleton className="w-full h-4 rounded-sm" />
        <Skeleton className="w-full h-4 rounded-sm" />
        <Skeleton className="w-full h-4 rounded-sm" />
        <Skeleton className="w-full h-4 rounded-sm" />
        <Skeleton className="w-full h-4 rounded-sm" />
        <Skeleton className="w-full h-4 rounded-sm" />
        <Skeleton className="w-full h-4 rounded-sm" />
        <Skeleton className="w-full h-4 rounded-sm" />
      </div>
    </div>
  );
};

export default React.memo(HotelCardSkeleton);
