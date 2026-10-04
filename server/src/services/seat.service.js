import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { SEAT_STATUS } from '../constants/seatStatus.js';
import { calculateSeatPrice, generateSeatList } from '../utils/seatLayout.js';
import * as showSeatRepository from '../repositories/showSeat.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as screenRepository from '../repositories/screen.repository.js';

const MS_PER_MINUTE = 60 * 1000;

export const generateForShow = async (show, screen) => {
  const seats = generateSeatList(screen.seatLayout).map((seat) => ({
    show: show._id,
    seatLabel: seat.seatLabel,
    row: seat.row,
    column: seat.column,
    category: seat.category,
    price: calculateSeatPrice(show.basePrice, seat.priceMultiplier),
  }));

  await showSeatRepository.insertMany(seats);
  return seats.length;
};

export const deleteForShow = (showId) => showSeatRepository.deleteByShow(showId);

// Called when a show's basePrice changes (no active bookings exist at that point).
export const repriceShow = async (show, screen) => {
  for (const category of screen.seatLayout.categories) {
    await showSeatRepository.updatePriceByCategory(
      show._id,
      category.name,
      calculateSeatPrice(show.basePrice, category.priceMultiplier),
    );
  }
};

export const getSeatMap = async (showId) => {
  const show = await showRepository.findById(showId);
  if (!show) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Show not found');

  const screen = await screenRepository.findById(show.screen);
  const now = new Date();
  const counts = { AVAILABLE: 0, LOCKED: 0, BOOKED: 0 };

  const seats = (await showSeatRepository.findForSeatMap(show._id)).map((seat) => {
    // An expired lock counts as free, even before the cron job has released it.
    const isExpiredLock =
      seat.status === SEAT_STATUS.LOCKED && (!seat.lockExpiresAt || seat.lockExpiresAt <= now);
    const status = isExpiredLock ? SEAT_STATUS.AVAILABLE : seat.status;
    counts[status] += 1;

    return {
      seatLabel: seat.seatLabel,
      row: seat.row,
      column: seat.column,
      category: seat.category,
      price: seat.price,
      status,
    };
  });

  return {
    show: { id: show.id, startTime: show.startTime, endTime: show.endTime, status: show.status },
    layout: { rows: screen?.seatLayout.rows, columns: screen?.seatLayout.columns },
    counts,
    seats,
  };
};

// Locks all requested seats or none. Returns the locked seats (with DB prices).
export const lockSeats = async ({ showId, labels, userId, bookingId }) => {
  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + env.SEAT_LOCK_MINUTES * MS_PER_MINUTE);

  const result = await showSeatRepository.lockAvailable({
    showId,
    labels,
    userId,
    bookingId,
    now,
    lockExpiresAt,
  });

  if (result.modifiedCount !== labels.length) {
    // Release only the seats that carry OUR booking id.
    await showSeatRepository.releaseByBooking(bookingId);
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'One or more selected seats are no longer available. Please choose different seats.',
    );
  }

  const seats = await showSeatRepository.findByBooking(bookingId);
  return { seats, lockExpiresAt };
};

export const releaseBookingSeats = (bookingId) => showSeatRepository.releaseByBooking(bookingId);

export const releaseExpiredLocks = async (now) => {
  const result = await showSeatRepository.releaseExpiredLocks(now);
  return result.modifiedCount;
};
