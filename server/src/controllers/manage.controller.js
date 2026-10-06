import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as analyticsService from '../services/analytics.service.js';
import * as staffService from '../services/staff.service.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getDashboardStats(req.user);
  ApiResponse.send(res, { data: stats });
});

export const listBookings = asyncHandler(async (req, res) => {
  const { bookings, meta } = await staffService.listBookings(req.user, req.validated.query);
  ApiResponse.send(res, { data: { bookings }, meta });
});

export const listShows = asyncHandler(async (req, res) => {
  const { shows, meta } = await staffService.listShows(req.user, req.validated.query);
  ApiResponse.send(res, { data: { shows }, meta });
});

export const checkIn = asyncHandler(async (req, res) => {
  const booking = await staffService.checkIn(req.user, req.validated.body.bookingCode, {
    ip: req.ip,
  });
  ApiResponse.send(res, { message: 'Checked in', data: { booking } });
});
