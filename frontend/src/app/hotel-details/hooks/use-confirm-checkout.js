import { SEARCH_PARAMS_KEYS } from '@/config/app.config';
import useStayParams from '@/hooks/use-stay-params';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, useSearchParams } from 'react-router';

function useConfirmCheckout(selectedRoomId) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { city, startDate, endDate, roomsCount } = useStayParams();

  const form = useForm({
    defaultValues: {
      roomsCount,
      bookingDates: {
        from: dayjs(startDate).toDate(),
        to: dayjs(endDate).toDate(),
      },
    },
  });

  const handleUpdateDetailsFormSubmit = (data) => {
    searchParams.set(SEARCH_PARAMS_KEYS.CHECKIN, dayjs(data.bookingDates.from).format('YYYY-MM-DD'));
    searchParams.set(SEARCH_PARAMS_KEYS.CHECKOUT, dayjs(data.bookingDates.to).format('YYYY-MM-DD'));
    searchParams.set(SEARCH_PARAMS_KEYS.ROOMS, data.roomsCount);
    setSearchParams(searchParams);
    form.reset(data);
  };

  const handleCheckoutConfirm = () => {
    const params = new URLSearchParams({
      city,
      startDate,
      endDate,
      roomsCount,
      [SEARCH_PARAMS_KEYS.SELECTED_ROOM]: selectedRoomId,
    });
    navigate(`/hotels/${id}/checkout?${params.toString()}`);
  };

  return { form, handleUpdateDetailsFormSubmit, handleCheckoutConfirm };
}

export default useConfirmCheckout;
