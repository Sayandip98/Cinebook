import { logger } from '../config/logger.js';
import { NOTIFICATION_TYPE } from '../constants/notificationType.js';
import * as notificationRepository from '../repositories/notification.repository.js';

export const notify = async (userId, { type = NOTIFICATION_TYPE.SYSTEM, title, message, link }) => {
  try {
    await notificationRepository.create({ user: userId, type, title, message, link });
  } catch (error) {
    logger.error('Notification write failed', { type, error: error.message });
  }
};
