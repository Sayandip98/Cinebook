import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { USER_SORT_OPTIONS } from '../constants/userSort.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import * as userRepository from '../repositories/user.repository.js';
import * as refreshTokenRepository from '../repositories/refreshToken.repository.js';
import * as auditService from './audit.service.js';
import { ROLES } from '../constants/roles.js';
import * as theaterRepository from '../repositories/theater.repository.js';

const requireUser = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  return user;
};

const isSameUser = (actor, targetId) => String(actor._id) === String(targetId);

const buildUserFilter = ({ role, isActive, isVerified, search }) => {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;
  if (isVerified !== undefined) filter.isVerified = isVerified;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }
  return filter;
};

export const listUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildUserFilter(query);
  const sort = USER_SORT_OPTIONS[query.sort] ?? USER_SORT_OPTIONS.newest;

  const [users, total] = await Promise.all([
    userRepository.findPaginated(filter, { sort, skip, limit }),
    userRepository.count(filter),
  ]);

  return { users, meta: buildPaginationMeta({ page, limit, total }) };
};

export const getUser = (id) => requireUser(id);

export const changeRole = async (actor, targetId, newRole, { ip } = {}) => {
  // Also guarantees the last admin cannot demote themselves.
  if (isSameUser(actor, targetId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot change your own role');
  }

  const target = await requireUser(targetId);
  if (target.role === newRole) return target;

    if (target.role === ROLES.THEATER_MANAGER && newRole !== ROLES.THEATER_MANAGER) {
      const managedCount = await theaterRepository.countByManager(target._id);
      if (managedCount > 0) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          `This user still manages ${managedCount} theater(s). Reassign them first.`,
        );
      }
    }
  const previousRole = target.role;
  const updated = await userRepository.updateById(targetId, { $set: { role: newRole } });

  // The old role's sessions should not linger.
  await refreshTokenRepository.revokeAllForUser(targetId);

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
    entity: 'User',
    entityId: target._id,
    meta: { from: previousRole, to: newRole },
    ip,
  });
  logger.info('User role changed', {
    actorId: actor.id,
    targetId,
    from: previousRole,
    to: newRole,
  });

  return updated;
};

export const changeStatus = async (actor, targetId, isActive, { ip } = {}) => {
  if (isSameUser(actor, targetId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot change your own status');
  }

  const target = await requireUser(targetId);
  if (target.isActive === isActive) return target;

  const updated = await userRepository.updateById(targetId, { $set: { isActive } });

  // `protect` already rejects inactive users, so access tokens stop working at once.
  if (!isActive) await refreshTokenRepository.revokeAllForUser(targetId);

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.USER_STATUS_CHANGED,
    entity: 'User',
    entityId: target._id,
    meta: { from: target.isActive, to: isActive },
    ip,
  });
  logger.info('User status changed', { actorId: actor.id, targetId, isActive });

  return updated;
};
