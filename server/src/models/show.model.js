import mongoose from 'mongoose';
import { SHOW_STATUS, SHOW_STATUS_VALUES } from '../constants/showStatus.js';
import { SCREEN_TYPE_VALUES } from '../constants/screenType.js';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie is required'],
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen is required'],
    },
    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: [true, 'Theater is required'],
    },
    startTime: { type: Date, required: [true, 'Start time is required'] },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator(value) {
          return !this.startTime || value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    language: { type: String, required: [true, 'Language is required'], trim: true },
    format: {
      type: String,
      enum: { values: SCREEN_TYPE_VALUES, message: 'Invalid show format' },
      required: [true, 'Format is required'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    status: {
      type: String,
      enum: { values: SHOW_STATUS_VALUES, message: 'Invalid show status' },
      default: SHOW_STATUS.SCHEDULED,
    },
  },
  buildSchemaOptions(),
);

showSchema.index({ movie: 1, startTime: 1 });
showSchema.index({ theater: 1, startTime: 1 });
showSchema.index({ screen: 1, startTime: 1, endTime: 1 });

export default mongoose.model('Show', showSchema);
