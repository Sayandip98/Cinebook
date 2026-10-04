import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as bookingService from '../services/booking.service.js';

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
  ApiResponse.send(res, { message: 'Booking cancelled', data: { booking } });
});
