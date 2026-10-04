import Payment from '../models/payment.model.js';
import { PAYMENT_STATUS } from '../constants/paymentStatus.js';

export const create = (data) => Payment.create(data);

export const findByOrderId = (orderId) => Payment.findOne({ orderId });

export const findOpenForBooking = (bookingId) =>
  Payment.findOne({ booking: bookingId, status: PAYMENT_STATUS.CREATED }).sort({ createdAt: -1 });

export const findPaidForBooking = (bookingId) =>
  Payment.findOne({ booking: bookingId, status: PAYMENT_STATUS.PAID });

export const claimPaid = (orderId, { paymentId, method }, session) => {
  const update = { status: PAYMENT_STATUS.PAID, paymentId };
  if (method) update.method = method;

  return Payment.findOneAndUpdate(
    { orderId, status: { $in: [PAYMENT_STATUS.CREATED, PAYMENT_STATUS.FAILED] } },
    { $set: update },
    { new: true, session },
  );
};

export const markRefunded = (id, { refundId, refundAmount, reason }) =>
  Payment.findOneAndUpdate(
    { _id: id, status: PAYMENT_STATUS.PAID },
    {
      $set: {
        status: PAYMENT_STATUS.REFUNDED,
        refundId,
        refundAmount,
        failureReason: reason,
      },
    },
    { new: true },
  );

export const recordFailureReason = (id, failureReason) =>
  Payment.updateOne({ _id: id }, { $set: { failureReason } });

export const addWebhookEvent = (id, eventId) =>
  Payment.updateOne({ _id: id }, { $addToSet: { webhookEventIds: eventId } });
