import mongoose from 'mongoose';
import {
  PAYMENT_PROVIDER,
  PAYMENT_PROVIDER_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
} from '../constants/paymentStatus.js';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const paiseField = (label) => ({
  type: Number,
  min: [0, `${label} cannot be negative`],
  validate: { validator: Number.isInteger, message: `${label} must be an integer (paise)` },
});

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    provider: {
      type: String,
      enum: { values: PAYMENT_PROVIDER_VALUES, message: 'Invalid payment provider' },
      default: PAYMENT_PROVIDER.RAZORPAY,
    },
    orderId: { type: String, required: [true, 'Order id is required'], unique: true },
    paymentId: { type: String },
    signature: { type: String, select: false },
    amount: { ...paiseField('Amount'), required: [true, 'Amount is required'] },
    currency: { type: String, default: 'INR', uppercase: true },
    status: {
      type: String,
      enum: { values: PAYMENT_STATUS_VALUES, message: 'Invalid payment status' },
      default: PAYMENT_STATUS.CREATED,
    },
    method: { type: String, trim: true },
    refundId: { type: String },
    refundAmount: { ...paiseField('Refund amount'), default: 0 },
    failureReason: { type: String, trim: true },
    webhookEventIds: { type: [String], default: [] },
  },
  buildSchemaOptions(['signature']),
);

paymentSchema.index(
  { paymentId: 1 },
  { unique: true, partialFilterExpression: { paymentId: { $type: 'string' } } },
);
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
