import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as bookingService from '../services/booking.service.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user, req.validated.body);
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Seats reserved. Complete payment before the booking expires.',
    data: { booking },
  });
});

export const listMyBookings = asyncHandler(async (req, res) => {
  const { bookings, meta } = await bookingService.getMyBookings(req.user._id, req.validated.query);
  ApiResponse.send(res, { data: { bookings }, meta });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBooking(req.user, req.validated.params.id);
  ApiResponse.send(res, { data: { booking } });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.user, req.validated.params.id);

  let message = 'Booking cancelled';
  if (booking.status === BOOKING_STATUS.REFUNDED) {
    message = `Booking cancelled. Rs ${booking.refundAmount} will be refunded to your original payment method.`;
  } else if (booking.refundAmount > 0) {
    message =
      'Booking cancelled. We could not start the refund automatically, so our team will process it.';
  }
  ApiResponse.send(res, { message, data: { booking } });
});

export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await bookingService.getTicket(req.user, req.validated.params.id);
  ApiResponse.send(res, { data: ticket });
});