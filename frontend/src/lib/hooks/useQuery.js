import { useCallback, useEffect, useRef, useState } from 'react';
import axiosInstance from '../axios-instance';

/**
 * GET (or any method via options) with loading/error state.
 * `data` is the backend payload (envelope.data). `error` is the message string;
 * `errorInfo` is the full ApiError (status, subErrors ...).
 * Stale responses (unmounted component / changed url) are ignored.
 */
export default function useQuery({ url, options = {}, enabled = true }) {
  const [queryState, setQueryState] = useState({
    data: null,
    pending: enabled,
    error: null,
    errorInfo: null,
  });
  const requestId = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const optionsKey = JSON.stringify(options);

  const fetchData = useCallback(async () => {
    const id = ++requestId.current;
    setQueryState((prev) => ({ ...prev, pending: true, error: null, errorInfo: null }));
    try {
      const response = await axiosInstance({ url, ...optionsRef.current });
      if (id !== requestId.current) return;
      setQueryState({ data: response?.data ?? null, pending: false, error: null, errorInfo: null });
    } catch (e) {
      if (id !== requestId.current) return;
      setQueryState({ data: null, pending: false, error: e.message, errorInfo: e });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, optionsKey]);

  useEffect(() => {
    if (!enabled) {
      setQueryState((prev) => ({ ...prev, pending: false }));
      return undefined;
    }
    fetchData();
    return () => {
      requestId.current++; // ignore anything still in flight
    };
  }, [fetchData, enabled]);

  return { refetchQuery: fetchData, ...queryState };
}
