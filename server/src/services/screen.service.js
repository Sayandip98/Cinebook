import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { assertCanManageTheater } from '../utils/theaterAccess.js';
import * as screenRepository from '../repositories/screen.repository.js';
import * as theaterRepository from '../repositories/theater.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as auditService from './audit.service.js';

const requireTheater = async (id) => {
  const theater = await theaterRepository.findById(id);
  if (!theater) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Theater not found');
  return theater;
};

const requireScreen = async (id) => {
  const screen = await screenRepository.findById(id);
  if (!screen) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Screen not found');
  return screen;
};

export const listScreens = async (theaterId) => {
  const theater = await requireTheater(theaterId);
  if (!theater.isActive) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Theater not found');
  return screenRepository.findActiveByTheater(theater._id);
};

export const createScreen = async (actor, theaterId, data, { ip } = {}) => {
  const theater = await requireTheater(theaterId);
  assertCanManageTheater(actor, theater);

  if (!theater.isActive) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Cannot add screens to an inactive theater');
  }

  const screen = await screenRepository.create({ ...data, theater: theater._id });

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.SCREEN_CREATED,
    entity: 'Screen',
    entityId: screen._id,
    meta: { theater: String(theater._id), name: screen.name },
    ip,
  });
  return screen;
};

export const updateScreen = async (actor, id, data, { ip } = {}) => {
  const screen = await requireScreen(id);
  const theater = await requireTheater(screen.theater);
  assertCanManageTheater(actor, theater);

  // Seats are generated from the layout, so it is frozen while shows are scheduled.
  const changesLayout = data.seatLayout !== undefined;
  const deactivates = data.isActive === false && screen.isActive;
  if (
    (changesLayout || deactivates) &&
    (await showRepository.existsUpcomingForScreen(screen._id))
  ) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'This screen has upcoming shows. Cancel them before changing the layout or deactivating it.',
    );
  }

  screen.set(data);
  await screen.save();

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.SCREEN_UPDATED,
    entity: 'Screen',
    entityId: screen._id,
    meta: { fields: Object.keys(data) },
    ip,
  });
  return screen;
};

export const deactivateScreen = (actor, id, meta) =>
  updateScreen(actor, id, { isActive: false }, meta);
