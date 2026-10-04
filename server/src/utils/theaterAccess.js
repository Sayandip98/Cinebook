import { ApiError } from './ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';

export const assertCanManageTheater = (actor, theater) => {
  if (actor.role === ROLES.ADMIN) return;

  const isOwner =
    actor.role === ROLES.THEATER_MANAGER &&
    theater.manager &&
    String(theater.manager) === String(actor._id);

  if (!isOwner) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not manage this theater');
  }
};
