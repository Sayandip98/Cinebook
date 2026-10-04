import User from '../models/user.model.js';

const withOptionalPassword = (query, withPassword) =>
  withPassword ? query.select('+password') : query;

export const create = (data) => User.create(data);

export const findByEmail = (email, { withPassword = false } = {}) =>
  withOptionalPassword(User.findOne({ email: email.toLowerCase().trim() }), withPassword);

export const findById = (id, { withPassword = false } = {}) =>
  withOptionalPassword(User.findById(id), withPassword);

export const findByEmailVerifyHash = (hash) =>
  User.findOne({ emailVerifyTokenHash: hash, emailVerifyExpires: { $gt: new Date() } });

export const findByResetHash = (hash) =>
  User.findOne({ resetPasswordTokenHash: hash, resetPasswordExpires: { $gt: new Date() } });

export const updateById = (id, update) =>
  User.findByIdAndUpdate(id, update, { new: true, runValidators: true });

export const findPaginated = (filter, { sort, skip, limit }) =>
  User.find(filter).sort(sort).skip(skip).limit(limit);

export const count = (filter) => User.countDocuments(filter);