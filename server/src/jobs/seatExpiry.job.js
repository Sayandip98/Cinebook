import cron from 'node-cron';
import { logger } from '../config/logger.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as seatService from '../services/seat.service.js';

const SWEEP_BATCH_SIZE = 200;
const EVERY_MINUTE = '* * * * *';

let task = null;
let isRunning = false;

export const releaseExpiredReservations = async () => {
  const now = new Date();
  const staleBookings = await bookingRepository.findStalePending(now, SWEEP_BATCH_SIZE);

  let expiredCount = 0;
  for (const { _id } of staleBookings) {
    const expired = await bookingRepository.markExpired(_id, now);
    if (expired) {
      await seatService.releaseBookingSeats(_id);
      expiredCount += 1;
    }
  }

  const orphanLocksReleased = await seatService.releaseExpiredLocks(now);

  if (expiredCount > 0 || orphanLocksReleased > 0) {
    logger.info('Expired reservations released', { expiredCount, orphanLocksReleased });
  }
};

const runSafely = async () => {
  if (isRunning) return;
  isRunning = true;
  try {
    await releaseExpiredReservations();
  } catch (error) {
    logger.error('Seat expiry job failed', { error: error.message });
  } finally {
    isRunning = false;
  }
};

export const startJobs = () => {
  task = cron.schedule(EVERY_MINUTE, runSafely);
  logger.info('Background jobs started');
};

export const stopJobs = () => {
  task?.stop();
};
