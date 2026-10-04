import { logger } from '../config/logger.js';
import { NOTIFICATION_TYPE } from '../constants/notificationType.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as emailService from './email.service.js';
import * as notificationService from './notification.service.js';
import * as ticketService from './ticket.service.js';

export const notifyBookingConfirmed = async (bookingId) => {
  try {
    const booking = await bookingRepository.findByIdPopulated(bookingId);
    const user = await userRepository.findById(booking.user);
    if (!user) return;

    await notificationService.notify(user._id, {
      type: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      title: 'Booking confirmed',
      message: `Your seats for ${booking.show.movie.title} are confirmed. Booking code ${booking.bookingCode}.`,
      link: `/bookings/${booking.id}`,
    });

    const qrBuffer = await ticketService.generateQrBuffer(booking.bookingCode);
    emailService.sendBookingConfirmationEmail(user, booking, qrBuffer);
  } catch (error) {
    logger.error('Post-confirmation tasks failed', {
      bookingId: String(bookingId),
      error: error.message,
    });
  }
};
