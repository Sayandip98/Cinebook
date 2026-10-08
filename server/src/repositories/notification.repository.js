import Notification from '../models/notification.model.js';

export const create = (data) => Notification.create(data);

export const findPaginatedForUser = (filter, { skip, limit }) =>
  Notification.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit);

export const count = (filter) => Notification.countDocuments(filter);

// Filtering on `user` means one user can never touch another user's notifications.
export const markRead = async (id, userId) => {
  await Notification.updateOne(
    { _id: id, user: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );
  return Notification.findOne({ _id: id, user: userId });
};

export const markAllRead = (userId) =>
  Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );

export const deleteForUser = (id, userId) =>
  Notification.findOneAndDelete({ _id: id, user: userId });
