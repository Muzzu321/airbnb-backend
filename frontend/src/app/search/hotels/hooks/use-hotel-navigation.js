import useStayParams from '@/hooks/use-stay-params';

function useHotelNavigation(id) {
  const { city, startDate, endDate, roomsCount } = useStayParams();
  const params = new URLSearchParams({ city, startDate, endDate, roomsCount });
  return `/hotels/${id}?${params.toString()}`;
}

export default useHotelNavigation;
