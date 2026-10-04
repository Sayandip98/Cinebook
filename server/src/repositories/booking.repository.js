import Booking from '../models/booking.model.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

const POPULATE = {
  path: 'show',
  select: 'startTime endTime language format status movie theater screen',
  populate: [
    { path: 'movie', select: 'title slug poster durationMinutes certificate' },
    { path: 'theater', select: 'name city address' },
    { path: 'screen', select: 'name type' },
  ],
};

export const create = (data) => Booking.create(data);

export const findById = (id, session) => Booking.findById(id).session(session ?? null);

export const confirmPending = (id, session) =>
  Booking.findOneAndUpdate(
    { _id: id, status: BOOKING_STATUS.PENDING },
    { $set: { status: BOOKING_STATUS.CONFIRMED } },
    { new: true, session },
  );

export const cancelConfirmed = (id, { reason, refundAmount }, session) =>
  Booking.findOneAndUpdate(
    { _id: id, status: BOOKING_STATUS.CONFIRMED, checkedInAt: null },
    {
      $set: {
        status: BOOKING_STATUS.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
        refundAmount,
      },
    },
    { new: true, session },
  );

export const markRefunded = (id) =>
  Booking.findOneAndUpdate(
    { _id: id, status: BOOKING_STATUS.CANCELLED },
    { $set: { status: BOOKING_STATUS.REFUNDED } },
    { new: true },
  );

export const findByIdPopulated = (id) => Booking.findById(id).populate(POPULATE);

export const findPaginatedForUser = (filter, { skip, limit }) =>
  Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(POPULATE);

export const count = (filter) => Booking.countDocuments(filter);

export const existsActiveForShow = (showId) =>
  Booking.exists({
    show: showId,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] },
  });

export const findActivePendingForUserShow = (userId, showId) =>
  Booking.findOne({
    user: userId,
    show: showId,
    status: BOOKING_STATUS.PENDING,
    expiresAt: { $gt: new Date() },
  });

export const findStalePending = (now, limit) =>
  Booking.find({ status: BOOKING_STATUS.PENDING, expiresAt: { $lte: now } })
    .select('_id')
    .limit(limit)
    .lean();

// Atomic: returns null if the booking is no longer a stale PENDING one.
export const markExpired = (id, now) =>
  Booking.findOneAndUpdate(
    { _id: id, status: BOOKING_STATUS.PENDING, expiresAt: { $lte: now } },
    { $set: { status: BOOKING_STATUS.EXPIRED } },
    { new: true },
  );

export const cancelPending = (id, reason) =>
  Booking.findOneAndUpdate(
    { _id: id, status: BOOKING_STATUS.PENDING },
    {
      $set: {
        status: BOOKING_STATUS.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    },
    { new: true },
  );
