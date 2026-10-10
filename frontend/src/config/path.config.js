const PATHS = {

  LANDING: '/',

  SIGN_IN: '/signin',
  SIGN_UP: '/signup',

  HOTEL: '/hotels/:id',
  SEARCH: 'SEARCH',

  PROFILE: '/me/profile',
  BOOKING_HISTORY: '/me/booking-history',

  CHECKOUT: '/hotels/:id/checkout',
  PAYMENTS_STATUS: '/payments/:bookingId/status',

  SETTINGS: {
    PROFILE: '/me/profile',
    BOOKING_HISTORY: '/me/booking-history',
    TRAVELERS_MANAGEMENT: '/me/travelers',
  },
  ADMIN: {
    LIST_HOTELS: '/admin',
    CREATE_HOTEL: 'hotels/create',
    DASHBOARD: {
      ROOT: '/admin/hotels/:hotelId',
      OVERVIEW: 'overview',
      EDIT_HOTEL: 'edit',
      BOOKINGS: 'bookings',
      ROOMS: {
        ROOT: 'rooms',
        INVENTORY: 'rooms/:roomId/inventory',
        EDIT_ROOM: 'rooms/:roomId/edit',
        CREATE: 'rooms/create'
      }
    }
  }
}

export {PATHS};