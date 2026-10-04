import Booking from '../models/booking.model.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

export const existsActiveForShow = (showId) =>
  Booking.exists({
    show: showId,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
  });
