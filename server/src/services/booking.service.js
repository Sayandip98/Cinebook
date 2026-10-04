import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { SHOW_STATUS } from '../constants/showStatus.js';
import { ROLES } from '../constants/roles.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { calculateBookingTotals } from '../utils/pricing.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as seatService from './seat.service.js';

const notFound = () => new ApiError(HTTP_STATUS.NOT_FOUND, 'Booking not found');

// A booking that is not yours looks like a booking that does not exist.
const requireAccessibleBooking = async (actor, id) => {
  const booking = await bookingRepository.findById(id);
  const isOwner = booking && String(booking.user) === String(actor._id);
  if (!booking || (!isOwner && actor.role !== ROLES.ADMIN)) throw notFound();
  return booking;
};

export const createBooking = async (user, { showId, seats: labels }) => {
  const show = await showRepository.findById(showId);
  if (!show) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Show not found');
  if (show.status !== SHOW_STATUS.SCHEDULED || show.startTime <= new Date()) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Bookings are closed for this show');
  }

  const pending = await bookingRepository.findActivePendingForUserShow(user._id, show._id);
  if (pending) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'You already have a pending booking for this show. Complete or cancel it first.',
    );
  }

  // The id exists before the lock, so the lock can carry it and be undone precisely.
  const bookingId = new mongoose.Types.ObjectId();
  const { seats, lockExpiresAt } = await seatService.lockSeats({
    showId: show._id,
    labels,
    userId: user._id,
    bookingId,
  });

  try {
    // Prices come from the locked ShowSeat documents, never from the client.
    // TODO (Phase 11): validate the coupon here and pass its discount below.
    const totals = calculateBookingTotals(seats, {
      convenienceFeePerSeat: env.CONVENIENCE_FEE_PER_SEAT,
      discount: 0,
    });

    await bookingRepository.create({
      _id: bookingId,
      user: user._id,
      show: show._id,
      seats: seats.map(({ seatLabel, category, price }) => ({ seatLabel, category, price })),
      ...totals,
      status: BOOKING_STATUS.PENDING,
      expiresAt: lockExpiresAt,
    });
  } catch (error) {
    await seatService.releaseBookingSeats(bookingId);
    throw error;
  }

  logger.info('Booking created', {
    bookingId: String(bookingId),
    userId: user.id,
    showId: show.id,
    seatCount: labels.length,
  });
  return bookingRepository.findByIdPopulated(bookingId);
};

export const getMyBookings = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { user: userId };
  if (query.status) filter.status = query.status;

  const [bookings, total] = await Promise.all([
    bookingRepository.findPaginatedForUser(filter, { skip, limit }),
    bookingRepository.count(filter),
  ]);

  return { bookings, meta: buildPaginationMeta({ page, limit, total }) };
};

export const getBooking = async (actor, id) => {
  const booking = await requireAccessibleBooking(actor, id);
  return bookingRepository.findByIdPopulated(booking._id);
};

export const cancelBooking = async (actor, id) => {
  const booking = await requireAccessibleBooking(actor, id);

  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    // TODO (Phase 7): refund policy based on time left before the show.
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Cancelling paid bookings is not available yet');
  }
  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Booking is already ${booking.status.toLowerCase()}`);
  }

  const cancelled = await bookingRepository.cancelPending(booking._id, 'Cancelled by user');
  if (!cancelled) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Booking can no longer be cancelled');
  }

  await seatService.releaseBookingSeats(booking._id);
  logger.info('Pending booking cancelled', { bookingId: booking.id, userId: String(actor._id) });
  return bookingRepository.findByIdPopulated(booking._id);
};
