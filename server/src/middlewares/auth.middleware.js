import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { verifyAccessToken } from '../utils/token.js';
import * as userRepository from '../repositories/user.repository.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const [scheme, token] = (req.get('Authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
  }

  const payload = verifyAccessToken(token);

  const user = await userRepository.findById(payload.sub);
  if (!user) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
  if (!user.isActive) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account disabled');
  if (user.changedPasswordAfter(payload.iat)) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Password changed, please log in again');
  }

  req.user = user;
  next();
});

export const requireVerified = (req, _res, next) => {
  if (!req.user?.isVerified) {
    return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Please verify your email first'));
  }
  return next();
};