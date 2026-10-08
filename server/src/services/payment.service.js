import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { isRazorpayConfigured, razorpay } from '../config/razorpay.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { NOTIFICATION_TYPE } from '../constants/notificationType.js';
import { toPaise } from '../utils/pricing.js';
import { runInTransaction } from '../utils/transaction.js';
import { MIN_CANCELLATION_HOURS, getRefundPercent } from '../utils/refundPolicy.js';
import { verifyPaymentSignature, verifyWebhookSignature } from '../utils/razorpaySignature.js';
import * as paymentRepository from '../repositories/payment.repository.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as showSeatRepository from '../repositories/showSeat.repository.js';
import * as bookingConfirmationService from './bookingConfirmation.service.js';
import * as notificationService from './notification.service.js';
import { PAYMENT_STATUS } from '../constants/paymentStatus.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import * as auditService from './audit.service.js';
import * as couponRepository from '../repositories/coupon.repository.js';

const CURRENCY = 'INR';

export const OUTCOME = Object.freeze({
  CONFIRMED: 'CONFIRMED',
  ALREADY_PROCESSED: 'ALREADY_PROCESSED',
  REFUNDED: 'REFUNDED',
  REFUND_FAILED: 'REFUND_FAILED',
});

// Thrown inside the transaction to abort it when the payment cannot be fulfilled.
class RefundRequired extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

const assertConfigured = () => {
  if (!isRazorpayConfigured) {
    throw new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE ?? 503, 'Payments are not configured');
  }
};

// The SDK rejects with plain objects ({ statusCode, error: { description } }), not Errors.
const callRazorpay = async (call) => {
  try {
    return await call();
  } catch (error) {
    const detail = error?.error?.description ?? error?.message ?? 'Unknown error';
    logger.error('Razorpay request failed', { detail, statusCode: error?.statusCode });
    throw new ApiError(502, 'Payment provider error. Please try again.');
  }
};

const notFoundBooking = () => new ApiError(HTTP_STATUS.NOT_FOUND, 'Booking not found');

export const createOrder = async (user, bookingId) => {
  assertConfigured();

  const booking = await bookingRepository.findById(bookingId);
  if (!booking || String(booking.user) !== String(user._id)) throw notFoundBooking();
  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Booking is ${booking.status.toLowerCase()}`);
  }
  if (!booking.expiresAt || booking.expiresAt <= new Date()) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Booking has expired. Please select seats again.');
  }

  // Reuse the open order so retries and double clicks never create duplicates.
  let payment = await paymentRepository.findOpenForBooking(booking._id);
  if (!payment) {
    const order = await callRazorpay(() =>
      razorpay.orders.create({
        amount: toPaise(booking.totalAmount),
        currency: CURRENCY,
        receipt: booking.bookingCode,
        notes: { bookingId: String(booking._id) },
      }),
    );

    payment = await paymentRepository.create({
      booking: booking._id,
      user: user._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
    logger.info('Payment order created', { bookingId: booking.id, orderId: order.id });
  }

  return {
    keyId: env.RAZORPAY_KEY_ID,
    orderId: payment.orderId,
    amount: payment.amount,
    currency: payment.currency,
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    expiresAt: booking.expiresAt,
  };
};

// Full refund through Razorpay. Returns true on success, false on failure (never throws).
const issueRefund = async (payment, amountPaise, reason) => {
  try {
    const refund = await callRazorpay(() =>
      razorpay.payments.refund(payment.paymentId, {
        amount: amountPaise,
        speed: 'normal',
        notes: { reason: reason.slice(0, 200), bookingId: String(payment.booking) },
      }),
    );
    await paymentRepository.markRefunded(payment._id, {
      refundId: refund.id,
      refundAmount: amountPaise,
      reason,
    });
    logger.info('Refund issued', { orderId: payment.orderId, amountPaise, reason });
    return true;
  } catch (error) {
    logger.error('Refund failed; manual refund needed', {
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      error: error.message,
    });
    await paymentRepository.recordFailureReason(payment._id, `Refund failed: ${reason}`);
    return false;
  }
};

const confirmInTransaction = (orderId, paymentId, method) =>
  runInTransaction(async (session) => {
    // The claim is inside the transaction, so a concurrent webhook/verify conflicts and retries.
    const payment = await paymentRepository.claimPaid(orderId, { paymentId, method }, session);
    if (!payment) return { outcome: OUTCOME.ALREADY_PROCESSED };

    const booking = await bookingRepository.findById(payment.booking, session);
    if (!booking || booking.status !== BOOKING_STATUS.PENDING) {
      throw new RefundRequired(`Booking is ${booking?.status ?? 'missing'}`);
    }

    // Seats decide, not the clock: they must all still carry this booking's lock.
    const seatResult = await showSeatRepository.markBookedByBooking(booking._id, session);
    if (seatResult.modifiedCount !== booking.seats.length) {
      throw new RefundRequired('Seats were released before the payment arrived');
    }

    const confirmed = await bookingRepository.confirmPending(booking._id, session);
    if (!confirmed) throw new RefundRequired('Booking could not be confirmed');

    if (booking.coupon) await couponRepository.incrementUsed(booking.coupon, session);
    return { outcome: OUTCOME.CONFIRMED, bookingId: booking._id };
  });

const refundUnfulfillablePayment = async (orderId, paymentId, method, reason) => {
  const payment = await paymentRepository.claimPaid(orderId, { paymentId, method });
  if (!payment) return { outcome: OUTCOME.ALREADY_PROCESSED };

  logger.warn('Payment cannot be fulfilled; refunding', { orderId, reason });
  const refunded = await issueRefund(payment, payment.amount, reason);
  await notificationService.notify(payment.user, {
    type: NOTIFICATION_TYPE.REFUND_PROCESSED,
    title: 'Payment refunded',
    message: refunded
      ? 'Your payment arrived after the seats were released, so it has been refunded.'
      : 'Your payment arrived after the seats were released. Our team will refund it shortly.',
  });

  return {
    outcome: refunded ? OUTCOME.REFUNDED : OUTCOME.REFUND_FAILED,
    bookingId: payment.booking,
  };
};

// The single place where a successful payment is turned into a booking (or a refund).
// Safe to call any number of times, from the client verify call and from the webhook.
export const settlePayment = async ({ orderId, razorpayPaymentId, method }) => {
  try {
    const result = await confirmInTransaction(orderId, razorpayPaymentId, method);
    if (result.outcome === OUTCOME.CONFIRMED) {
      logger.info('Booking confirmed', { bookingId: String(result.bookingId), orderId });
      bookingConfirmationService.notifyBookingConfirmed(result.bookingId);
    }
    return result;
  } catch (error) {
    if (!(error instanceof RefundRequired)) throw error;
    return refundUnfulfillablePayment(orderId, razorpayPaymentId, method, error.reason);
  }
};

export const verifyPayment = async (user, { orderId, paymentId, signature }) => {
  assertConfigured();

  if (!verifyPaymentSignature({ orderId, paymentId, signature }, env.RAZORPAY_KEY_SECRET)) {
    logger.warn('Invalid payment signature', { orderId, userId: user.id });
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid payment signature');
  }

  const payment = await paymentRepository.findByOrderId(orderId);
  if (!payment || String(payment.user) !== String(user._id)) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payment not found');
  }

  const result = await settlePayment({ orderId, razorpayPaymentId: paymentId });

  if (result.outcome === OUTCOME.REFUNDED) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'Your seats were released before the payment arrived. The payment has been refunded.',
    );
  }
  if (result.outcome === OUTCOME.REFUND_FAILED) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'Your seats were released before the payment arrived. Our team will refund the payment.',
    );
  }

  return bookingRepository.findByIdPopulated(payment.booking);
};

const handleCaptured = async (entity, eventId) => {
  if (!entity?.order_id || !entity?.id) return;

  const payment = await paymentRepository.findByOrderId(entity.order_id);
  if (!payment) {
    logger.warn('Webhook for unknown order ignored', { orderId: entity.order_id });
    return;
  }
  if (eventId && payment.webhookEventIds.includes(eventId)) return;

  if (entity.amount !== payment.amount) {
    logger.error('Webhook amount mismatch; ignored', { orderId: entity.order_id });
    return;
  }

  await settlePayment({
    orderId: entity.order_id,
    razorpayPaymentId: entity.id,
    method: entity.method,
  });
  if (eventId) await paymentRepository.addWebhookEvent(payment._id, eventId);
};

const handleFailed = async (entity) => {
  if (!entity?.order_id) return;

  const payment = await paymentRepository.findByOrderId(entity.order_id);
  if (!payment) return;

  // The booking stays PENDING: Razorpay lets the user retry on the same order.
  await paymentRepository.recordFailureReason(
    payment._id,
    entity.error_description ?? 'Payment failed',
  );
  await notificationService.notify(payment.user, {
    type: NOTIFICATION_TYPE.PAYMENT_FAILED,
    title: 'Payment failed',
    message: 'Your payment did not go through. You can retry before the booking expires.',
  });
};

export const handleWebhook = async ({ rawBody, signature, eventId }) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw new ApiError(503, 'Webhooks are not configured');
  }
  if (
    !Buffer.isBuffer(rawBody) ||
    !verifyWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET)
  ) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid webhook signature');
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Malformed webhook body');
  }

  const entity = event.payload?.payment?.entity;
  switch (event.event) {
    case 'payment.captured':
      await handleCaptured(entity, eventId);
      break;
    case 'payment.failed':
      await handleFailed(entity);
      break;
    default:
      logger.debug('Webhook event ignored', { event: event.event });
  }
};

export const cancelPaidBooking = async (actor, booking) => {
  assertConfigured();

  if (booking.checkedInAt) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'This booking has already been used');
  }

  const show = await showRepository.findById(booking.show);
  const percent = getRefundPercent(show.startTime.getTime() - Date.now());
  if (percent === null) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Paid bookings can be cancelled up to ${MIN_CANCELLATION_HOURS} hours before the show`,
    );
  }

  const payment = await paymentRepository.findPaidForBooking(booking._id);
  if (!payment) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'No completed payment found for this booking');
  }

  const refundRupees = Math.round(booking.totalAmount * percent) / 100;

  await runInTransaction(async (session) => {
    const cancelled = await bookingRepository.cancelConfirmed(
      booking._id,
      { reason: 'Cancelled by user', refundAmount: refundRupees },
      session,
    );
    if (!cancelled) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Booking can no longer be cancelled');
    }
    await showSeatRepository.releaseBookedByBooking(booking._id, session);
    if (booking.coupon) await couponRepository.decrementUsed(booking.coupon, session);
  });

  // Seats are free and the booking is cancelled; now return the money.
  const refunded = await issueRefund(payment, toPaise(refundRupees), 'Booking cancelled by user');
  if (refunded) await bookingRepository.markRefunded(booking._id);

  await notificationService.notify(booking.user, {
    type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
    title: 'Booking cancelled',
    message: `Booking ${booking.bookingCode} was cancelled. Refund: Rs ${refundRupees}.`,
    link: `/bookings/${booking.id}`,
  });

  logger.info('Paid booking cancelled', {
    bookingId: booking.id,
    percent,
    refunded,
    actorId: String(actor._id),
  });
  return bookingRepository.findByIdPopulated(booking._id);
};

// Admin tool: retries a refund that failed earlier.
export const retryRefund = async (actor, paymentId, { ip } = {}) => {
  assertConfigured();

  const payment = await paymentRepository.findById(paymentId);
  if (!payment) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payment not found');

  const needsRefund =
    payment.status === PAYMENT_STATUS.PAID && payment.failureReason?.startsWith('Refund failed');
  if (!needsRefund) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'This payment is not waiting for a refund');
  }

  // A user cancellation refunds a percentage; every other case refunds the full payment.
  const booking = await bookingRepository.findById(payment.booking);
  const isPaidCancellation =
    booking?.status === BOOKING_STATUS.CANCELLED && booking.refundAmount > 0;
  const amountPaise = isPaidCancellation ? toPaise(booking.refundAmount) : payment.amount;

  const refunded = await issueRefund(payment, amountPaise, 'Refund processed by admin');
  if (!refunded) {
    throw new ApiError(502, 'The refund failed again. Check the Razorpay dashboard, then retry.');
  }
  if (isPaidCancellation) await bookingRepository.markRefunded(booking._id);

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.REFUND_RETRIED,
    entity: 'Payment',
    entityId: payment._id,
    meta: { amountPaise },
    ip,
  });
  await notificationService.notify(payment.user, {
    type: NOTIFICATION_TYPE.REFUND_PROCESSED,
    title: 'Refund processed',
    message: `Rs ${amountPaise / 100} has been refunded to your original payment method.`,
  });

  return paymentRepository.findById(payment._id);
};
