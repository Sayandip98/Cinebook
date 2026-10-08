import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { NOTIFICATION_TYPE } from '../constants/notificationType.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as notificationService from '../services/notification.service.js';

const REMINDER_WINDOW_MS = 2 * 60 * 60 * 1000;
const BATCH_SIZE = 200;
const EVERY_TEN_MINUTES = '*/10 * * * *';

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

let task = null;
let isRunning = false;

export const sendShowReminders = async () => {
  const now = new Date();
  const showIds = await showRepository.findIdsStartingBetween(
    now,
    new Date(now.getTime() + REMINDER_WINDOW_MS),
  );
  if (showIds.length === 0) return 0;

  const bookings = await bookingRepository.findDueForReminder(showIds, BATCH_SIZE);

  let sent = 0;
  for (const booking of bookings) {
    const claimed = await bookingRepository.claimReminder(booking._id, now);
    if (!claimed) continue;

    const { show } = booking;
    await notificationService.notify(booking.user, {
      type: NOTIFICATION_TYPE.SHOW_REMINDER,
      title: 'Your show starts soon',
      message: `${show.movie.title} starts at ${timeFormatter.format(show.startTime)} at ${show.theater.name}. Seats: ${booking.seats.map((seat) => seat.seatLabel).join(', ')}.`,
      link: `/bookings/${booking.id}`,
    });
    sent += 1;
  }

  if (sent > 0) logger.info('Show reminders sent', { sent });
  return sent;
};

const runSafely = async () => {
  if (isRunning) return;
  isRunning = true;
  try {
    await sendShowReminders();
  } catch (error) {
    logger.error('Show reminder job failed', { error: error.message });
  } finally {
    isRunning = false;
  }
};

export const startReminderJob = () => {
  task = cron.schedule(EVERY_TEN_MINUTES, runSafely);
};

export const stopReminderJob = () => {
  task?.stop();
};
