import ShowSeat from '../models/showSeat.model.js';
import { SEAT_STATUS } from '../constants/seatStatus.js';

const releaseUpdate = () => ({
  $set: { status: SEAT_STATUS.AVAILABLE },
  $unset: { lockedBy: 1, lockExpiresAt: 1, booking: 1 },
});

export const insertMany = (documents) => ShowSeat.insertMany(documents);

export const existsForShow = (showId) => ShowSeat.exists({ show: showId });

export const deleteByShow = (showId) => ShowSeat.deleteMany({ show: showId });

export const findForSeatMap = (showId) =>
  ShowSeat.find({ show: showId })
    .select('seatLabel row column category price status lockExpiresAt')
    .sort({ row: 1, column: 1 })
    .lean();

// Atomic per document: only seats that are free (or hold an expired lock) are modified.
export const lockAvailable = ({ showId, labels, userId, bookingId, now, lockExpiresAt }) =>
  ShowSeat.updateMany(
    {
      show: showId,
      seatLabel: { $in: labels },
      $or: [
        { status: SEAT_STATUS.AVAILABLE },
        { status: SEAT_STATUS.LOCKED, lockExpiresAt: { $lte: now } },
      ],
    },
    {
      $set: {
        status: SEAT_STATUS.LOCKED,
        lockedBy: userId,
        lockExpiresAt,
        booking: bookingId,
      },
    },
  );

export const findByBooking = (bookingId) =>
  ShowSeat.find({ booking: bookingId, status: SEAT_STATUS.LOCKED }).sort({ row: 1, column: 1 });

// Matches on the booking id, so seats re-locked by someone else are never touched.
export const releaseByBooking = (bookingId) =>
  ShowSeat.updateMany({ booking: bookingId, status: SEAT_STATUS.LOCKED }, releaseUpdate());

export const releaseExpiredLocks = (now) =>
  ShowSeat.updateMany(
    { status: SEAT_STATUS.LOCKED, lockExpiresAt: { $lte: now } },
    releaseUpdate(),
  );

export const updatePriceByCategory = (showId, category, price) =>
  ShowSeat.updateMany({ show: showId, category }, { $set: { price } });
