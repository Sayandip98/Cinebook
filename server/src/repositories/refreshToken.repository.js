import RefreshToken from '../models/refreshToken.model.js';

export const create = (data) => RefreshToken.create(data);

export const findByHash = (tokenHash) => RefreshToken.findOne({ tokenHash });

export const revokeIfActive = (tokenHash, replacedByTokenHash) => {
  const update = { revokedAt: new Date() };
  if (replacedByTokenHash) update.replacedByTokenHash = replacedByTokenHash;

  return RefreshToken.findOneAndUpdate(
    { tokenHash, revokedAt: null },
    { $set: update },
    { new: true },
  );
};

export const revokeAllForUser = (userId) =>
  RefreshToken.updateMany({ user: userId, revokedAt: null }, { $set: { revokedAt: new Date() } });

export const findActiveByUser = (userId) =>
  RefreshToken.find({ user: userId, revokedAt: null, expiresAt: { $gt: new Date() } }).sort({
    createdAt: -1,
  });

export const revokeByIdForUser = (id, userId) =>
  RefreshToken.findOneAndUpdate(
    { _id: id, user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
    { new: true },
  );