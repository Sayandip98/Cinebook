import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { BOOKING_STATUS, BOOKING_STATUS_VALUES } from '../constants/bookingStatus.js';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const MAX_CODE_ATTEMPTS = 5;
const MAX_SEATS_PER_BOOKING = 6;

const generateBookingCode = () => {
  const bytes = randomBytes(CODE_LENGTH);
  const suffix = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
  return `CB${suffix}`;
};

const money = (label) => ({
  type: Number,
  min: [0, `${label} cannot be negative`],
});

const seatSnapshotSchema = new mongoose.Schema(
  {
    seatLabel: { type: String, required: true },
    category: { type: String, required: true },
    price: { ...money('Seat price'), required: true },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: [true, 'Booking code is required'], unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show is required'],
    },
    seats: {
      type: [seatSnapshotSchema],
      validate: {
        validator: (value) => value.length >= 1 && value.length <= MAX_SEATS_PER_BOOKING,
        message: `A booking must have between 1 and ${MAX_SEATS_PER_BOOKING} seats`,
      },
    },
    subtotal: { ...money('Subtotal'), required: [true, 'Subtotal is required'] },
    discount: { ...money('Discount'), default: 0 },
    convenienceFee: { ...money('Convenience fee'), default: 0 },
    totalAmount: { ...money('Total amount'), required: [true, 'Total amount is required'] },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    status: {
      type: String,
      enum: { values: BOOKING_STATUS_VALUES, message: 'Invalid booking status' },
      default: BOOKING_STATUS.PENDING,
    },
    expiresAt: Date,
    cancelledAt: Date,
    cancellationReason: { type: String, trim: true, maxlength: 300 },
    refundAmount: { ...money('Refund amount'), default: 0 },
    checkedInAt: Date,
    reminderSentAt: Date,
  },
  buildSchemaOptions(),
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1, status: 1 });
bookingSchema.index({ status: 1, expiresAt: 1 });

bookingSchema.pre('validate', async function () {
  if (this.bookingCode) return;

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const candidate = generateBookingCode();
    const taken = await this.constructor.exists({ bookingCode: candidate });
    if (!taken) {
      this.bookingCode = candidate;
      return;
    }
  }
  throw new Error('Could not generate a unique booking code');
});

export default mongoose.model('Booking', bookingSchema);
