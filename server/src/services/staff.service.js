import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { assertCanManageTheater } from '../utils/theaterAccess.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as theaterRepository from '../repositories/theater.repository.js';
import * as auditService from './audit.service.js';
import { getTheaterScope } from './staffScope.js';

const MS_PER_HOUR = 60 * 60 * 1000;
const CHECK_IN_OPENS_HOURS = 3;

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  dateStyle: 'medium',
  timeStyle: 'short',
});

const conflict = (message) => new ApiError(HTTP_STATUS.CONFLICT, message);

export const listBookings = async (actor, query) => {
  const { page, limit, skip } = parsePagination(query);
  const theaterIds = await getTheaterScope(actor);

  const filter = {};
  if (theaterIds) filter.show = { $in: await showRepository.findIdsByTheaters(theaterIds) };
  if (query.status) filter.status = query.status;
  if (query.search) {
    // Prefix match on the uppercase code can use the unique index.
    filter.bookingCode = new RegExp(`^${escapeRegex(query.search.toUpperCase())}`);
  }

  const [bookings, total] = await Promise.all([
    bookingRepository.findPaginatedForStaff(filter, { skip, limit }),
    bookingRepository.count(filter),
  ]);

  return { bookings, meta: buildPaginationMeta({ page, limit, total }) };
};

const buildTheaterFilter = (theaterIds, requestedId) => {
  if (!theaterIds) return requestedId;
  if (!requestedId) return { $in: theaterIds };
  return theaterIds.some((id) => String(id) === requestedId) ? requestedId : { $in: [] };
};

export const listShows = async (actor, query) => {
  const { page, limit, skip } = parsePagination(query);
  const theaterIds = await getTheaterScope(actor);
  const now = new Date();

  const filter = {};
  const theater = buildTheaterFilter(theaterIds, query.theaterId);
  if (theater) filter.theater = theater;
  if (query.status) filter.status = query.status;
  if (query.when === 'upcoming') filter.startTime = { $gte: now };
  if (query.when === 'past') filter.startTime = { $lt: now };

  const sort = query.when === 'upcoming' ? { startTime: 1, _id: 1 } : { startTime: -1, _id: 1 };

  const [shows, total] = await Promise.all([
    showRepository.findPaginated(filter, { sort, skip, limit }),
    showRepository.count(filter),
  ]);

  return { shows, meta: buildPaginationMeta({ page, limit, total }) };
};

export const checkIn = async (actor, bookingCode, { ip } = {}) => {
  const booking = await bookingRepository.findByCode(bookingCode);
  if (!booking) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'No booking found with this code');

  const show = await showRepository.findById(booking.show);
  const theater = await theaterRepository.findById(show.theater);
  assertCanManageTheater(actor, theater);

  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw conflict(`This booking is ${booking.status.toLowerCase()} and cannot be used`);
  }
  if (booking.checkedInAt) {
    throw conflict(`Ticket already used on ${timeFormatter.format(booking.checkedInAt)}`);
  }

  const now = new Date();
  if (now.getTime() < show.startTime.getTime() - CHECK_IN_OPENS_HOURS * MS_PER_HOUR) {
    throw conflict(`Check-in opens ${CHECK_IN_OPENS_HOURS} hours before the show`);
  }
  if (now > show.endTime) throw conflict('This show has already ended');

  const updated = await bookingRepository.checkIn(booking._id, now);
  if (!updated) throw conflict('Ticket was just used on another device');

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.BOOKING_CHECKED_IN,
    entity: 'Booking',
    entityId: booking._id,
    meta: { bookingCode: booking.bookingCode },
    ip,
  });

  return bookingRepository.findByIdForStaff(booking._id);
};
