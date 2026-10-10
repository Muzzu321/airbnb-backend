import API_CONFIG from "@/config/api.config";
import { SEARCH_PARAMS_KEYS } from "@/config/app.config";
import axiosInstance from "@/lib/axios-instance";
import useStayParams from "@/hooks/use-stay-params";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router";

/**
 * Creates the booking (POST /bookings/init) exactly ONCE when the checkout page opens.
 * This reserves inventory on the backend, so it must never be re-fired by a re-render
 * (the ref guard) and it is a mutation, not a cacheable query.
 */
function useInitCheckout() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { startDate, endDate, roomsCount } = useStayParams();
  const started = useRef(false);
  const [state, setState] = useState({ data: null, pending: true, error: null, errorInfo: null });

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const roomId = Number(searchParams.get(SEARCH_PARAMS_KEYS.SELECTED_ROOM));
    if (!roomId) {
      setState({
        data: null,
        pending: false,
        error: "No room was selected. Go back to the hotel page and choose a room.",
        errorInfo: null,
      });
      return;
    }

    axiosInstance
      .post(API_CONFIG.BOOKING.INIT_BOOKING.URL, {
        hotelId: Number(id),
        roomId,
        checkInDate: startDate,
        checkOutDate: endDate,
        roomsCount,
      })
      .then((response) =>
        setState({ data: response.data, pending: false, error: null, errorInfo: null })
      )
      .catch((e) =>
        setState({ data: null, pending: false, error: e.message, errorInfo: e })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setBooking = (booking) => setState((prev) => ({ ...prev, data: booking }));

  return { ...state, setBooking };
}

export default useInitCheckout;
