import API_CONFIG from '@/config/api.config';
import useQuery from '@/lib/hooks/useQuery';
import useStayParams from '@/hooks/use-stay-params';
import { useParams } from 'react-router';

function useGetHotelInfo() {
  const { id } = useParams();
  const { startDate, endDate, roomsCount } = useStayParams();

  // Backend contract (HotelInfoRequestDto): startDate, endDate, roomsCount as query parameters.
  const { data, pending, error, errorInfo } = useQuery({
    url: API_CONFIG.HOTEL.HOTEL_INFO.URL(id),
    options: { params: { startDate, endDate, roomsCount } },
  });
  return { data, pending, error, errorInfo };
}

export default useGetHotelInfo;
