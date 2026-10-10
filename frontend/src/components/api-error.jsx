import { ERROR_FALLBACK } from '@/config/app.config';
import { cn } from '@/lib/utils';

// errorMessage must be a string (hooks expose `error` as the message).
const ApiError = ({ errorName, errorMessage, className }) => {
  return (
    <div
      className={cn(
        `h-[calc(100vh-124px)] flex flex-col justify-center items-center gap-3`,
        className
      )}
      role="alert"
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500 duration-500 animate-in zoom-in-50"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 text-center px-4">
        <h2 className="text-xl font-semibold text-red-600 text-danger-400">
          {errorName || ERROR_FALLBACK.TITLE}
        </h2>
        <p className="font-medium">
          {typeof errorMessage === 'string' && errorMessage
            ? errorMessage
            : ERROR_FALLBACK.DESCRIPTION}
        </p>
      </div>
    </div>
  );
};

export default ApiError;
