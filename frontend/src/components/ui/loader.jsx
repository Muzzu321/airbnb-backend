import React from 'react';
import Icon from './icon';
import { cn, getAssetPath } from '@/lib/utils';

const LoadingBar = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'h-1 w-full rounded-full overflow-hidden before:absolute relative before:h-full before:bg-[#5329FF] before:bottom-0 before:top-0 before:left-0 bg-blue-200 before:animate-loading-bar',
        className
      )}
      {...props}
    />
  );
};
const AppLoader = () => {
  return (
    <div className="flex items-center justify-center absolute inset-0 bg-white z-10">
      <div className="flex flex-col items-center w-full gap-8 max-w-52">
        <img
          width={85}
          height={85}
          src={getAssetPath('bookingcom-icon-logo.svg')}
          alt="logo"
        />
        <LoadingBar />
      </div>
    </div>
  );
};

const LoadingSpinner = ({ containerClassName, className }) => {
  return (
    <div
      className={cn(
        `flex items-center justify-center min-h-screen`,
        containerClassName
      )}
    >
      <Icon
        icon="spinner"
        strokeWidth={2.5}
        size={32}
        className={cn('animate-spin text-brand', className)}
      />
    </div>
  );
};

export { LoadingSpinner, AppLoader };
