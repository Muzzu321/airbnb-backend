// Single source of truth for backend routes. Paths are RELATIVE to VITE_SERVER_BASE_URL
// (which already contains the "/api/v1" context path) - do not repeat "/api/v1" here.
const API_CONFIG = {
  HOTEL: {
    BROWSE_HOTELS: '/hotels/search',
    HOTEL_INFO: {
      URL: (hotelId) => `/hotels/${hotelId}/info`,
    },
  },
  AUTH: {
    SIGN_IN: '/auth/login',
    SIGN_UP: '/auth/signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USER: {
    PROFILE: '/users/profile',
    BOOKING_HISTORY: '/users/myBookings',
  },
  BOOKING: {
    INIT_BOOKING: {
      METHOD: 'POST',
      URL: '/bookings/init',
    },
    // The backend replaces the booking's guest list with the ids sent here
    // (so this single endpoint is used both to add and to remove guests).
    SET_GUESTS: {
      METHOD: 'POST',
      URL: (bookingId) => `/bookings/${bookingId}/addGuests`,
    },
    PAYMENT_BOOKING: {
      METHOD: 'POST',
      URL: (bookingId) => `/bookings/${bookingId}/payments`,
    },
    STATUS_BOOKING: {
      METHOD: 'GET',
      URL: (bookingId) => `/bookings/${bookingId}/status`,
    },
    CANCEL_BOOKING: {
      METHOD: 'POST',
      URL: (bookingId) => `/bookings/${bookingId}/cancel`,
    },
  },
  TRAVELLER: {
    GET_TRAVELLERS: '/users/guests',
    ADD_TRAVELLER: {
      METHOD: 'POST',
      URL: '/users/guests',
    },
    UPDATE_TRAVELLER: {
      METHOD: 'PUT',
      URL: (guestId) => `/users/guests/${guestId}`,
    },
    DELETE_TRAVELLER: {
      METHOD: 'DELETE',
      URL: (guestId) => `/users/guests/${guestId}`,
    },
  },
  ADMIN: {
    HOTELS: '/admin/hotels',
    HOTEL: (hotelId) => `/admin/hotels/${hotelId}`,
    ACTIVATE_HOTEL: (hotelId) => `/admin/hotels/${hotelId}/activate`,
    HOTEL_BOOKINGS: (hotelId) => `/admin/hotels/${hotelId}/bookings`,
    HOTEL_REPORT: (hotelId) => `/admin/hotels/${hotelId}/reports`,
    ROOMS: (hotelId) => `/admin/hotels/${hotelId}/rooms`,
    ROOM: (hotelId, roomId) => `/admin/hotels/${hotelId}/rooms/${roomId}`,
    INVENTORY: (roomId) => `/admin/inventory/rooms/${roomId}`,
  },
};

export default API_CONFIG;
