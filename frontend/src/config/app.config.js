export const SERVICE_LIST = [
  {
    id: 1,
    title: 'Stays',
    icon: 'bed',
    active: true,
  },
  {
    id: 2,
    title: 'Flights',
    icon: 'flight',
  },
  {
    id: 4,
    title: 'Car rentals',
    icon: 'car',
  },
  {
    id: 5,
    title: 'Attractions',
    icon: 'attraction',
  },
  {
    id: 6,
    title: 'Airport taxis',
    icon: 'taxi',
  },
];
export const TRENDING_DESTINATIONS = [
  {
    title: 'New Delhi',
    image: 'delhi.jpg',
    className: 'sm:col-span-3 sm:col-start-1 col-span-full',
  },
  {
    title: 'Bangalore',
    image: 'bangalore.jpg',
    className: 'sm:col-span-3 sm:col-start-4 col-span-full',
  },
  {
    title: 'Mumbai',
    image: 'mumbai.jpg',
    className: 'md:col-span-2 md:col-start-1 col-span-full',
  },
  {
    title: 'Chennai',
    image: 'chennai.jpg',
    className: 'md:col-span-2 md:col-start-3 sm:col-span-3 col-span-full',
  },
  {
    title: 'Hyderabad',
    image: 'hyderabad.jpg',
    className: 'md:col-span-2 md:col-start-5 sm:col-span-3 col-span-full',
  },
];

export const FOOTER_SECTION = [
  {
    title: 'Support',
    links: [
      { text: 'Coronavirus (COVID-19) FAQs', href: '#' },
      { text: 'Manage your trips', href: '#' },
      { text: 'Contact Customer Service', href: '#' },
      { text: 'Safety resource centre', href: '#' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { text: 'Genius loyalty programme', href: '#' },
      { text: 'Seasonal and holiday deals', href: '#' },
      { text: 'Travel articles', href: '#' },
      { text: 'Booking.com for Business', href: '#' },
      { text: 'Traveller Review Awards', href: '#' },
      { text: 'Car hire', href: '#' },
      { text: 'Flight finder', href: '#' },
      { text: 'Restaurant reservations', href: '#' },
      { text: 'Booking.com for Travel Agents', href: '#' },
    ],
  },
  {
    title: 'Terms and settings',
    links: [
      { text: 'Privacy & cookies', href: '#' },
      { text: 'Terms and conditions', href: '#' },
      { text: 'Grievance officer', href: '#' },
      { text: 'Modern Slavery Statement', href: '#' },
      { text: 'Human Rights Statement', href: '#' },
    ],
  },
  {
    title: 'Partners',
    links: [
      { text: 'Extranet login', href: '#' },
      { text: 'Partner help', href: '#' },
      { text: 'List your property', href: '#' },
      { text: 'Become an affiliate', href: '#' },
    ],
  },
  {
    title: 'About',
    links: [
      { text: 'About Booking.com', href: 'https://codingshuttle.com' },
      { text: 'How we work', href: '#' },
      { text: 'Sustainability', href: '#' },
      { text: 'Press centre', href: '#' },
      { text: 'Careers', href: '#' },
      { text: 'Investor relations', href: '#' },
      { text: 'Corporate contact', href: '#' },
    ],
  },
];


export const SOCIAL_LINKS = [
  { icon: 'pinterest', href: '#', title: 'Pinterest' },
  { icon: 'twitter', href: '#', title: 'Twitter' },
  { icon: 'instagram', href: '#', title: 'Instagram' },
  { icon: 'youtube', href: '#', title: 'Youtube' },
];

export const DESTINATIONS = [
  { city: 'Jaipur', country: 'India' },
  { city: 'Delhi', country: 'India' },
  { city: 'Goa', country: 'India' },
  { city: 'Gurgaon', country: 'India' },
  { city: 'North Goa', country: 'India' },
  { city: 'Mumbai', country: 'India' },
  { city: 'Bangalore', country: 'India' },
  { city: 'Hyderabad', country: 'India' },
  { city: 'Chennai', country: 'India' },
  { city: 'Pune', country: 'India' }
];

export const SEARCH_RESULT_PAGE_LIMIT = 10;
export const MAX_ROOMS_PER_BOOKING = 10;

export const SEARCH_PARAMS_KEYS = {
  CHECKIN: 'startDate',
  CHECKOUT: 'endDate',
  ROOMS: 'roomsCount',
  LOCATION: 'city',
  SELECTED_ROOM: 'selected_rcid',
  PAGE: 'page',
  NEXT_REDIRECT: 'next',
};

export const ERROR_FALLBACK = {
  TITLE: 'Internal Server Error',
  DESCRIPTION: 'Something went wrong. Please try again later.',
};
// Keys are exactly the backend BookingStatus enum values.
export const bookingStatusVariant = {
  RESERVED: {
    className: 'border-sky-600 bg-sky-100 text-sky-700',
    text: 'Reserved',
  },
  GUESTS_ADDED: {
    className: 'border-sky-600 bg-sky-100 text-sky-700',
    text: 'Guests added',
  },
  PAYMENTS_PENDING: {
    className: 'border-amber-600 bg-amber-100 text-amber-700',
    text: 'Payment pending',
  },
  CONFIRMED: {
    className: 'border-green-600 bg-green-100 text-green-700',
    text: 'Confirmed',
  },
  CANCELLED: {
    className: 'border-red-600 bg-red-100 text-red-600',
    text: 'Cancelled',
  },
  EXPIRED: {
    className: 'border-gray-500 bg-gray-100 text-gray-600',
    text: 'Expired',
  },
};
