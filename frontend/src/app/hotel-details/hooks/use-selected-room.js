import { SEARCH_PARAMS_KEYS } from "@/config/app.config";
import useStayParams, { getBilledDays } from "@/hooks/use-stay-params";
import { useSearchParams } from "react-router";

// Rooms whose price is null are not available for every selected night (backend returns price=null then).
export const isRoomBookable = (room) =>
  room && room.price !== null && room.price !== undefined;

function useGetSelectedRoomDetails(rooms = []) {
  const [searchParams] = useSearchParams();
  const { startDate, endDate, roomsCount } = useStayParams();

  const details = {
    estimatedTotal: 0,
    billedDays: getBilledDays(startDate, endDate),
    roomsCount,
    selectedRoom: null,
  };

  if (!rooms || rooms.length === 0) return details;

  const selectedRoomId = Number(searchParams.get(SEARCH_PARAMS_KEYS.SELECTED_ROOM));
  const room =
    rooms.find((item) => item.id === selectedRoomId) ??
    rooms.find(isRoomBookable) ??
    rooms[0];

  details.selectedRoom = room;
  if (isRoomBookable(room)) {
    // ESTIMATE only: average nightly price x rooms x billed days. The authoritative amount is
    // computed by the backend when the booking is created.
    details.estimatedTotal = Math.round(room.price * roomsCount * details.billedDays);
  }

  return details;
}

export default useGetSelectedRoomDetails;
