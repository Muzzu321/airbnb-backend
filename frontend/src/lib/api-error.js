// Dependency-free helpers so they can be unit tested with plain Node.

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = details.status ?? null; // numeric HTTP status (null when there was no response)
    this.code = details.code ?? null; // backend status name, e.g. "NOT_FOUND"
    this.subErrors = details.subErrors ?? [];
    this.isNetworkError = Boolean(details.isNetworkError);
    this.isTimeout = Boolean(details.isTimeout);
  }
}

const DEFAULT_MESSAGES = {
  400: 'The request was invalid. Please check the entered details.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to do this.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with the current state. Please refresh and try again.',
  422: 'Some of the submitted data could not be processed.',
};

/**
 * Converts an Axios error into an ApiError.
 * The backend wraps errors as: { timeStamp, data: null, error: { status, message, subErrors } }
 * but framework/proxy errors may have a different shape or no body at all, so every access is guarded.
 */
export function normalizeApiError(axiosError) {
  const response = axiosError?.response;

  if (!response) {
    const isTimeout =
      axiosError?.code === 'ECONNABORTED' ||
      axiosError?.code === 'ETIMEDOUT' ||
      /timeout/i.test(axiosError?.message || '');
    return new ApiError(
      isTimeout
        ? 'The server took too long to respond. Please try again.'
        : 'Cannot reach the server. Check your connection and that the backend is running.',
      { isNetworkError: !isTimeout, isTimeout }
    );
  }

  const status = response.status;
  const body = response.data;
  const backendError = body && typeof body === 'object' ? body.error : null;

  let message = backendError?.message;
  if (typeof message !== 'string' || !message.trim()) {
    message =
      DEFAULT_MESSAGES[status] ||
      (status >= 500
        ? 'Something went wrong on the server. Please try again later.'
        : 'Something went wrong.');
  }

  const subErrors = Array.isArray(backendError?.subErrors)
    ? backendError.subErrors
    : [];

  return new ApiError(message, {
    status,
    code: typeof backendError?.status === 'string' ? backendError.status : null,
    subErrors,
  });
}

/** Message plus validation details, ready for a toast/description. */
export function describeError(error) {
  if (!error) return '';
  const base = error.message || 'Something went wrong.';
  return error.subErrors?.length
    ? `${base} (${error.subErrors.join('; ')})`
    : base;
}
