// Runs `fn` once at a time: callers that arrive while it is in flight share the same promise.
// Used so that many parallel 401 responses trigger exactly ONE token refresh.
export function createSingleFlight(fn) {
  let inFlight = null;
  return (...args) => {
    if (!inFlight) {
      inFlight = Promise.resolve()
        .then(() => fn(...args))
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };
}
