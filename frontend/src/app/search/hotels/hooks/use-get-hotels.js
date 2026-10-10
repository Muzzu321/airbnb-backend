import API_CONFIG from '@/config/api.config';
import {
  SEARCH_PARAMS_KEYS,
  SEARCH_RESULT_PAGE_LIMIT,
} from '@/config/app.config';
import useQuery from '@/lib/hooks/useQuery';
import useStayParams from '@/hooks/use-stay-params';
import { useSearchParams } from 'react-router';

function useGetHotels() {
  const [searchParams] = useSearchParams();
  const { city, startDate, endDate, roomsCount } = useStayParams();
  const page = Math.max(Number(searchParams.get(SEARCH_PARAMS_KEYS.PAGE)) || 1, 1);

  const { data, pending, error } = useQuery({
    url: API_CONFIG.HOTEL.BROWSE_HOTELS,
    enabled: Boolean(city), // the backend requires a city
    options: {
      params: {
        city,
        startDate,
        endDate,
        roomsCount,
        page: page - 1,
        size: SEARCH_RESULT_PAGE_LIMIT,
      },
    },
  });

  // Spring's Page serialises as {content,totalElements,...}; also accept the {page:{totalElements}} DTO form.
  const hotels = data?.content ?? [];
  const totalEntries = data?.totalElements ?? data?.page?.totalElements ?? hotels.length;

  return { hotels, totalEntries, pending, error, city, hasCity: Boolean(city) };
}

export default useGetHotels;
