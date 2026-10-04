import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { mailer } from '../config/mailer.js';
import { verifyEmailTemplate } from '../templates/verifyEmail.template.js';
import { resetPasswordTemplate } from '../templates/resetPassword.template.js';
import { bookingConfirmationTemplate } from '../templates/bookingConfirmation.template.js';

const VERIFY_EMAIL_PATH = '/verify-email';
const RESET_PASSWORD_PATH = '/reset-password';

const buildLink = (path, token) => `${env.CLIENT_URL.split(',')[0].trim()}${path}?token=${token}`;

const sendMail = async ({ to, subject, html, devLink, attachments }) => {
  if (!mailer) {
    if (env.isProduction) {
      logger.warn('Email not sent: SMTP is not configured', { subject });
    } else {
      logger.info(`[DEV EMAIL] ${subject} -> ${to}: ${devLink}`);
    }
    return;
  }

  try {
    await mailer.sendMail({ from: env.EMAIL_FROM, to, subject, html, attachments });
    logger.info('Email sent', { subject });
  } catch (error) {
    logger.error('Email send failed', { subject, error: error.message });
  }
};

export const sendVerificationEmail = (user, rawToken) => {
  const link = buildLink(VERIFY_EMAIL_PATH, rawToken);
  return sendMail({
    to: user.email,
    subject: 'Verify your CineBook email',
    html: verifyEmailTemplate({
      name: user.name,
      link,
      expiresInHours: env.EMAIL_VERIFY_EXPIRES_HOURS,
    }),
    devLink: link,
  });
};

export const sendPasswordResetEmail = (user, rawToken) => {
  const link = buildLink(RESET_PASSWORD_PATH, rawToken);
  return sendMail({
    to: user.email,
    subject: 'Reset your CineBook password',
    html: resetPasswordTemplate({
      name: user.name,
      link,
      expiresInMinutes: env.RESET_PASSWORD_EXPIRES_MINUTES,
    }),
    devLink: link,
  });
};

export const sendBookingConfirmationEmail = (user, booking, qrBuffer) =>
  sendMail({
    to: user.email,
    subject: `Booking confirmed: ${booking.bookingCode}`,
    html: bookingConfirmationTemplate({ name: user.name, booking }),
    devLink: `Booking ${booking.bookingCode} confirmed`,
    attachments: [
      { filename: 'ticket-qr.png', content: qrBuffer, cid: 'ticket-qr', contentType: 'image/png' },
    ],
  });
