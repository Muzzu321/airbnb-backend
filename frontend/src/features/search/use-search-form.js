import { searchFormSchema } from '@/lib/validators/search-form-validator';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import useStayParams from '@/hooks/use-stay-params';

export default function useSearchForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stay = useStayParams();

  const defaultValues = {
    city: stay.city,
    roomsCount: stay.roomsCount,
    bookingDates: {
      from: dayjs(stay.startDate).toDate(),
      to: dayjs(stay.endDate).toDate(),
    },
  };

  const form = useForm({
    resolver: zodResolver(searchFormSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function searchSubmitHandler(data) {
    const sendData = {
      city: data.city.trim(),
      roomsCount: data.roomsCount,
      startDate: dayjs(data.bookingDates.from).format('YYYY-MM-DD'),
      endDate: dayjs(data.bookingDates.to).format('YYYY-MM-DD'),
    };
    const params = new URLSearchParams(sendData);
    navigate(`/search?${params.toString()}`);
  }

  return { form, searchSubmitHandler };
}
