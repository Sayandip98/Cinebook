import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';
import { generateOpaqueToken, hashToken, signAccessToken } from '../utils/token.js';
import * as userRepository from '../repositories/user.repository.js';
import * as refreshTokenRepository from '../repositories/refreshToken.repository.js';
import * as emailService from './email.service.js';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const DUMMY_HASH = bcrypt.hashSync('cinebook-dummy-password', env.BCRYPT_SALT_ROUNDS);

const unauthorized = (message) => new ApiError(HTTP_STATUS.UNAUTHORIZED, message);

const buildRefreshRecord = (userId, tokenHash, meta) => ({
  user: userId,
  tokenHash,
  userAgent: meta.userAgent?.slice(0, 300),
  ip: meta.ip,
  expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * MS_PER_DAY),
});

const issueSession = async (user, meta) => {
  const refreshToken = generateOpaqueToken();
  await refreshTokenRepository.create(buildRefreshRecord(user._id, hashToken(refreshToken), meta));
  return { user, accessToken: signAccessToken(user._id), refreshToken };
};

const handleTokenReuse = async (userId) => {
  await refreshTokenRepository.revokeAllForUser(userId);
  logger.warn('Refresh token reuse detected; all sessions revoked', { userId: String(userId) });
  throw unauthorized('Session is no longer valid. Please log in again.');
};

const issueEmailVerification = async (user) => {
  const rawToken = generateOpaqueToken();
  await userRepository.updateById(user._id, {
    emailVerifyTokenHash: hashToken(rawToken),
    emailVerifyExpires: new Date(Date.now() + env.EMAIL_VERIFY_EXPIRES_HOURS * MS_PER_HOUR),
  });
  emailService.sendVerificationEmail(user, rawToken);
};

export const register = async ({ name, email, password, phone }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Email is already registered');
  }

  const user = await userRepository.create({ name, email, password, phone, role: ROLES.USER });
  await issueEmailVerification(user);

  logger.info('User registered', { userId: user.id });
  return user;
};

export const login = async ({ email, password }, meta) => {
  const user = await userRepository.findByEmail(email, { withPassword: true });

  const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !passwordMatches) {
    logger.warn('Login failed', { email, ip: meta.ip });
    throw unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    logger.warn('Login blocked: account disabled', { userId: user.id });
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account disabled');
  }

  await userRepository.updateById(user._id, { lastLoginAt: new Date() });
  const session = await issueSession(user, meta);

  logger.info('Login successful', { userId: user.id, ip: meta.ip });
  return session;
};

export const refresh = async (rawToken, meta) => {
  if (!rawToken) throw unauthorized('Refresh token missing');

  const oldHash = hashToken(rawToken);
  const record = await refreshTokenRepository.findByHash(oldHash);
  if (!record) throw unauthorized('Invalid refresh token');

  if (record.revokedAt) await handleTokenReuse(record.user);
  if (record.expiresAt <= new Date()) throw unauthorized('Session expired. Please log in again.');

  const user = await userRepository.findById(record.user);
  if (!user || !user.isActive) throw unauthorized('Account unavailable');

  const issuedAtSeconds = Math.floor(record.createdAt.getTime() / 1000);
  if (user.changedPasswordAfter(issuedAtSeconds)) {
    throw unauthorized('Password changed. Please log in again.');
  }

  const newRefreshToken = generateOpaqueToken();
  const newHash = hashToken(newRefreshToken);
  const rotated = await refreshTokenRepository.revokeIfActive(oldHash, newHash);
  if (!rotated) await handleTokenReuse(record.user);

  await refreshTokenRepository.create(buildRefreshRecord(user._id, newHash, meta));

  return { user, accessToken: signAccessToken(user._id), refreshToken: newRefreshToken };
};

export const logout = async (rawToken) => {
  if (!rawToken) return;
  await refreshTokenRepository.revokeIfActive(hashToken(rawToken));
};

export const logoutAll = async (userId) => {
  await refreshTokenRepository.revokeAllForUser(userId);
  logger.info('All sessions revoked', { userId: String(userId) });
};

export const verifyEmail = async (rawToken) => {
  const user = await userRepository.findByEmailVerifyHash(hashToken(rawToken));
  if (!user) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired token');

  await userRepository.updateById(user._id, {
    $set: { isVerified: true },
    $unset: { emailVerifyTokenHash: 1, emailVerifyExpires: 1 },
  });
  logger.info('Email verified', { userId: user.id });
};

export const resendVerification = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (user && user.isActive && !user.isVerified) {
    await issueEmailVerification(user);
  }
};

export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user || !user.isActive) return;

  const rawToken = generateOpaqueToken();
  await userRepository.updateById(user._id, {
    resetPasswordTokenHash: hashToken(rawToken),
    resetPasswordExpires: new Date(Date.now() + env.RESET_PASSWORD_EXPIRES_MINUTES * MS_PER_MINUTE),
  });
  emailService.sendPasswordResetEmail(user, rawToken);
  logger.info('Password reset requested', { userId: user.id });
};

export const resetPassword = async (rawToken, newPassword) => {
  const user = await userRepository.findByResetHash(hashToken(rawToken));
  if (!user) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired token');

  user.password = newPassword;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await refreshTokenRepository.revokeAllForUser(user._id);
  logger.info('Password reset completed', { userId: user.id });
};

export const changePassword = async (userId, { currentPassword, newPassword }, meta) => {
  const user = await userRepository.findById(userId, { withPassword: true });
  if (!user) throw unauthorized('Authentication required');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Current password is incorrect');
  }
  if (await user.comparePassword(newPassword)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'New password must be different');
  }

  user.password = newPassword;
  await user.save();
  await refreshTokenRepository.revokeAllForUser(user._id);

  logger.info('Password changed', { userId: user.id });
  return issueSession(user, meta);
};

export const getMe = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  return user;
};

export const listSessions = async (userId, currentRawToken) => {
  const currentHash = currentRawToken ? hashToken(currentRawToken) : null;
  const records = await refreshTokenRepository.findActiveByUser(userId);

  return records.map((record) => ({
    id: record.id,
    userAgent: record.userAgent,
    ip: record.ip,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    isCurrent: currentHash !== null && record.tokenHash === currentHash,
  }));
};

export const revokeSession = async (userId, sessionId) => {
  const revoked = await refreshTokenRepository.revokeByIdForUser(sessionId, userId);
  if (!revoked) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Session not found');
};