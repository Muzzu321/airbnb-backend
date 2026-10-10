import API_CONFIG from '@/config/api.config';
import useQuery from '@/lib/hooks/useQuery';

function useGetBookingHistory() {
  const { data, pending, error, refetchQuery } = useQuery({
    url: API_CONFIG.USER.BOOKING_HISTORY,
  });

  // newest first
  const bookings = Array.isArray(data)
    ? [...data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    : [];

  return { data: bookings, pending, error, refetch: refetchQuery };
}

export default useGetBookingHistory;
