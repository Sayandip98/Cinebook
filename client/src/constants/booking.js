export const MAX_SEATS_PER_BOOKING = 6;

export const SEAT_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  LOCKED: 'LOCKED',
  BOOKED: 'BOOKED',
});

export const BOOKING_STATUS = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
});

export const BOOKING_STATUS_OPTIONS = [
  { value: '', label: 'All bookings' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING', label: 'Awaiting payment' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'EXPIRED', label: 'Expired' },
];
