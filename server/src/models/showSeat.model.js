import mongoose from 'mongoose';
import { SEAT_STATUS, SEAT_STATUS_VALUES } from '../constants/seatStatus.js';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const showSeatSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show is required'],
    },
    seatLabel: { type: String, required: [true, 'Seat label is required'], trim: true },
    row: { type: Number, required: [true, 'Row is required'], min: 1 },
    column: { type: Number, required: [true, 'Column is required'], min: 1 },
    category: { type: String, required: [true, 'Category is required'], uppercase: true },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: { values: SEAT_STATUS_VALUES, message: 'Invalid seat status' },
      default: SEAT_STATUS.AVAILABLE,
    },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockExpiresAt: Date,
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  },
  buildSchemaOptions(),
);

showSeatSchema.index({ show: 1, seatLabel: 1 }, { unique: true });
showSeatSchema.index({ show: 1, status: 1 });
showSeatSchema.index({ status: 1, lockExpiresAt: 1 });

export default mongoose.model('ShowSeat', showSeatSchema);
