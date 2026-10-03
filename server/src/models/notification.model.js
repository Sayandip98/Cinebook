import mongoose from 'mongoose';
import { NOTIFICATION_TYPE, NOTIFICATION_TYPE_VALUES } from '../constants/notificationType.js';
import { buildSchemaOptions } from '../utils/schemaTransform.js';

const NINETY_DAYS_IN_SECONDS = 60 * 60 * 24 * 90;

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: { values: NOTIFICATION_TYPE_VALUES, message: 'Invalid notification type' },
      default: NOTIFICATION_TYPE.SYSTEM,
    },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 500 },
    link: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  buildSchemaOptions(),
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: NINETY_DAYS_IN_SECONDS });

export default mongoose.model('Notification', notificationSchema);
