import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { THEATER_SORT_OPTIONS } from '../constants/catalogSort.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { containsInsensitive, exactMatchInsensitive } from '../utils/queryHelpers.js';
import { assertCanManageTheater } from '../utils/theaterAccess.js';
import * as theaterRepository from '../repositories/theater.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as auditService from './audit.service.js';

const EARTH_RADIUS_KM = 6378.1;

const requireTheater = async (id) => {
  const theater = await theaterRepository.findById(id);
  if (!theater) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Theater not found');
  return theater;
};

const assertValidManager = async (managerId) => {
  const manager = await userRepository.findById(managerId);
  if (!manager || manager.role !== ROLES.THEATER_MANAGER || !manager.isActive) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Manager must be an active THEATER_MANAGER user');
  }
};

const assertNoUpcomingShows = async (theaterId) => {
  if (await showRepository.existsUpcomingForTheater(theaterId)) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'This theater has upcoming shows. Cancel them first.');
  }
};

const toGeoPoint = (latitude, longitude) => ({ type: 'Point', coordinates: [longitude, latitude] });

const buildTheaterFilter = ({ search, city, lat, lng, radiusKm, isActive }) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive;
  if (city) filter.city = exactMatchInsensitive(city);
  if (search) filter.name = containsInsensitive(search);
  if (lat !== undefined && lng !== undefined) {
    filter.location = { $geoWithin: { $centerSphere: [[lng, lat], radiusKm / EARTH_RADIUS_KM] } };
  }
  return filter;
};

const runList = async (filter, query) => {
  const { page, limit, skip } = parsePagination(query);
  const sort = THEATER_SORT_OPTIONS[query.sort] ?? THEATER_SORT_OPTIONS.name_asc;

  const [theaters, total] = await Promise.all([
    theaterRepository.findPaginated(filter, { sort, skip, limit }),
    theaterRepository.count(filter),
  ]);

  return { theaters, meta: buildPaginationMeta({ page, limit, total }) };
};

export const listPublic = (query) =>
  runList({ ...buildTheaterFilter(query), isActive: true }, query);

// Admins see every theater (including inactive). Managers see only their own.
export const listManageable = (actor, query) => {
  const filter = buildTheaterFilter(query);
  if (actor.role !== ROLES.ADMIN) filter.manager = actor._id;
  return runList(filter, query);
};

export const listCities = async () => {
  const cities = await theaterRepository.findActiveCities();
  return cities.sort((a, b) => a.localeCompare(b));
};

export const getPublicTheater = async (id) => {
  const theater = await requireTheater(id);
  if (!theater.isActive) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Theater not found');
  return theater;
};

export const createTheater = async (actor, data, { ip } = {}) => {
  const { latitude, longitude, manager, ...details } = data;
  if (manager) await assertValidManager(manager);

  const theater = await theaterRepository.create({
    ...details,
    manager,
    location: toGeoPoint(latitude, longitude),
  });

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.THEATER_CREATED,
    entity: 'Theater',
    entityId: theater._id,
    meta: { name: theater.name, city: theater.city },
    ip,
  });
  return theater;
};

export const updateTheater = async (actor, id, data, { ip } = {}) => {
  const theater = await requireTheater(id);
  assertCanManageTheater(actor, theater);

  const { latitude, longitude, manager, isActive, ...details } = data;
  const isAdmin = actor.role === ROLES.ADMIN;

  if (!isAdmin && (manager !== undefined || isActive !== undefined)) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'Only an admin can change the manager or active status',
    );
  }

  const update = { ...details };
  if (latitude !== undefined) update.location = toGeoPoint(latitude, longitude);
  if (manager !== undefined) {
    await assertValidManager(manager);
    update.manager = manager;
  }
  if (isActive !== undefined) {
    if (!isActive && theater.isActive) await assertNoUpcomingShows(theater._id);
    update.isActive = isActive;
  }

  const updated = await theaterRepository.updateById(theater._id, { $set: update });

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.THEATER_UPDATED,
    entity: 'Theater',
    entityId: theater._id,
    meta: { fields: Object.keys(data) },
    ip,
  });
  return updated;
};

// "Delete" is a soft delete: bookings and shows keep pointing at the theater.
export const deactivateTheater = async (actor, id, { ip } = {}) => {
  const theater = await requireTheater(id);
  if (!theater.isActive) return theater;

  await assertNoUpcomingShows(theater._id);
  const updated = await theaterRepository.updateById(theater._id, { $set: { isActive: false } });

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.THEATER_DEACTIVATED,
    entity: 'Theater',
    entityId: theater._id,
    ip,
  });
  return updated;
};
