import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as notificationService from '../services/notification.service.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const { notifications, unreadCount, meta } = await notificationService.listForUser(
    req.user._id,
    req.validated.query,
  );
  ApiResponse.send(res, { data: { notifications, unreadCount }, meta });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  ApiResponse.send(res, { data: { count } });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.user._id, req.validated.params.id);
  ApiResponse.send(res, { data: { notification } });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  ApiResponse.send(res, { message: 'All notifications marked as read' });
});

export const removeNotification = asyncHandler(async (req, res) => {
  await notificationService.remove(req.user._id, req.validated.params.id);
  ApiResponse.send(res, { message: 'Notification deleted' });
});
