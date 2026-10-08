import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { NOTIFICATION_TYPE } from '../constants/notificationType.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import * as notificationRepository from '../repositories/notification.repository.js';

// A failed notification must never break the action that triggered it.
export const notify = async (userId, { type = NOTIFICATION_TYPE.SYSTEM, title, message, link }) => {
  try {
    await notificationRepository.create({ user: userId, type, title, message, link });
  } catch (error) {
    logger.error('Notification write failed', { type, error: error.message });
  }
};

export const listForUser = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = { user: userId };
  if (query.unread) filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    notificationRepository.findPaginatedForUser(filter, { skip, limit }),
    notificationRepository.count(filter),
    notificationRepository.count({ user: userId, isRead: false }),
  ]);

  return { notifications, unreadCount, meta: buildPaginationMeta({ page, limit, total }) };
};

export const getUnreadCount = (userId) =>
  notificationRepository.count({ user: userId, isRead: false });

export const markRead = async (userId, id) => {
  const notification = await notificationRepository.markRead(id, userId);
  if (!notification) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notification not found');
  return notification;
};

export const markAllRead = async (userId) => {
  await notificationRepository.markAllRead(userId);
};

export const remove = async (userId, id) => {
  const deleted = await notificationRepository.deleteForUser(id, userId);
  if (!deleted) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notification not found');
};
