import { MAX_ROOMS_PER_BOOKING, SEARCH_PARAMS_KEYS } from '@/config/app.config';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isIsoDate = (value) => ISO_DATE.test(value || '') && dayjs(value).isValid();

/**
 * Normalised stay details from the URL (?startDate=&endDate=&roomsCount=&city=).
 * The backend REQUIRES start/end dates and a rooms count, so missing/invalid values fall back to
 * today -> tomorrow and 1 room instead of sending an invalid request.
 */
export default function useStayParams() {
  const [searchParams] = useSearchParams();

  const today = dayjs().format('YYYY-MM-DD');
  let startDate = searchParams.get(SEARCH_PARAMS_KEYS.CHECKIN);
  let endDate = searchParams.get(SEARCH_PARAMS_KEYS.CHECKOUT);

  if (!isIsoDate(startDate) || startDate < today) startDate = today;
  if (!isIsoDate(endDate) || endDate <= startDate) {
    endDate = dayjs(startDate).add(1, 'day').format('YYYY-MM-DD');
  }

  const rooms = parseInt(searchParams.get(SEARCH_PARAMS_KEYS.ROOMS), 10);
  const roomsCount = Number.isFinite(rooms)
    ? Math.min(Math.max(rooms, 1), MAX_ROOMS_PER_BOOKING)
    : 1;

  return {
    city: (searchParams.get(SEARCH_PARAMS_KEYS.LOCATION) || '').trim(),
    startDate,
    endDate,
    roomsCount,
  };
}

// The backend charges one inventory day per calendar date from check-in to check-out INCLUSIVE
// (BookingServiceImpl: DAYS.between(in, out) + 1), so estimates must use the same count.
export const getBilledDays = (startDate, endDate) =>
  dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
export const getNights = (startDate, endDate) =>
  dayjs(endDate).diff(dayjs(startDate), 'day');
