import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';

export const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to perform this action'),
      );
    }
    return next();
  };

export const adminOnly = authorize(ROLES.ADMIN);

export const staffOnly = authorize(ROLES.ADMIN, ROLES.THEATER_MANAGER);