import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { MOVIE_STATUS } from '../constants/movieStatus.js';
import { SHOW_STATUS } from '../constants/showStatus.js';
import { SHOW_SORT_OPTIONS } from '../constants/catalogSort.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { exactMatchInsensitive } from '../utils/queryHelpers.js';
import { getDayRange } from '../utils/dateRange.js';
import { assertCanManageTheater } from '../utils/theaterAccess.js';
import * as showRepository from '../repositories/show.repository.js';
import * as movieRepository from '../repositories/movie.repository.js';
import * as screenRepository from '../repositories/screen.repository.js';
import * as theaterRepository from '../repositories/theater.repository.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as auditService from './audit.service.js';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;
const SHOW_BUFFER_MINUTES = 15;
const MAX_ADVANCE_DAYS = 60;

const requireShow = async (id) => {
  const show = await showRepository.findById(id);
  if (!show) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Show not found');
  return show;
};

const requireMovie = async (id) => {
  const movie = await movieRepository.findById(id);
  if (!movie) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Movie not found');
  return movie;
};

const requireTheater = async (id) => {
  const theater = await theaterRepository.findById(id);
  if (!theater) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Theater not found');
  return theater;
};

const matchMovieLanguage = (movie, language) => {
  const match = movie.languages.find((item) => item.toLowerCase() === language.toLowerCase());
  if (!match) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Movie is not available in ${language}. Available: ${movie.languages.join(', ')}`,
    );
  }
  return match;
};

const assertValidStartTime = (startTime) => {
  const now = Date.now();
  if (startTime.getTime() <= now) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Show start time must be in the future');
  }
  if (startTime.getTime() > now + MAX_ADVANCE_DAYS * MS_PER_DAY) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Shows can be scheduled at most ${MAX_ADVANCE_DAYS} days ahead`,
    );
  }
};

const computeEndTime = (startTime, movie) =>
  new Date(startTime.getTime() + movie.durationMinutes * MS_PER_MINUTE);

const assertNoOverlap = async (screenId, startTime, endTime, excludeId) => {
  const buffer = SHOW_BUFFER_MINUTES * MS_PER_MINUTE;
  const conflict = await showRepository.findOverlapping(
    screenId,
    new Date(startTime.getTime() - buffer),
    new Date(endTime.getTime() + buffer),
    excludeId,
  );

  if (conflict) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Overlaps with another show on this screen (${conflict.startTime.toISOString()} to ${conflict.endTime.toISOString()}). A ${SHOW_BUFFER_MINUTES}-minute gap is required between shows.`,
    );
  }
};

const assertNoActiveBookings = async (showId) => {
  if (await bookingRepository.existsActiveForShow(showId)) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'This show already has bookings and cannot be changed',
    );
  }
};

export const listShows = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const now = new Date();
  const filter = { status: SHOW_STATUS.SCHEDULED };

  // Only upcoming shows. A date narrows it to that IST day.
  if (query.date) {
    const { start, end } = getDayRange(query.date);
    filter.startTime = { $gte: start > now ? start : now, $lt: end };
  } else {
    filter.startTime = { $gte: now };
  }

  if (query.movieId) filter.movie = query.movieId;
  if (query.theaterId) filter.theater = query.theaterId;
  if (query.format) filter.format = query.format;
  if (query.language) filter.language = exactMatchInsensitive(query.language);

  if (query.city) {
    const cityTheaterIds = await theaterRepository.findActiveIdsByCity(query.city);
    if (query.theaterId) {
      const inCity = cityTheaterIds.some((id) => String(id) === query.theaterId);
      filter.theater = inCity ? query.theaterId : { $in: [] };
    } else {
      filter.theater = { $in: cityTheaterIds };
    }
  }

  const sort = SHOW_SORT_OPTIONS[query.sort] ?? SHOW_SORT_OPTIONS.time_asc;

  const [shows, total] = await Promise.all([
    showRepository.findPaginated(filter, { sort, skip, limit }),
    showRepository.count(filter),
  ]);

  return { shows, meta: buildPaginationMeta({ page, limit, total }) };
};

export const getShow = async (id) => {
  const show = await showRepository.findByIdPopulated(id);
  if (!show) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Show not found');
  return show;
};

export const createShow = async (actor, data, { ip } = {}) => {
  const movie = await requireMovie(data.movie);
  if (movie.status === MOVIE_STATUS.ENDED) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot schedule shows for an ended movie');
  }

  const screen = await screenRepository.findById(data.screen);
  if (!screen) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Screen not found');
  if (!screen.isActive) throw new ApiError(HTTP_STATUS.CONFLICT, 'Screen is not active');

  const theater = await requireTheater(screen.theater);
  assertCanManageTheater(actor, theater);
  if (!theater.isActive) throw new ApiError(HTTP_STATUS.CONFLICT, 'Theater is not active');

  const language = matchMovieLanguage(movie, data.language);
  assertValidStartTime(data.startTime);

  const endTime = computeEndTime(data.startTime, movie);
  await assertNoOverlap(screen._id, data.startTime, endTime);

  // TODO (Phase 6): generate the ShowSeat documents for this show right here.
  const show = await showRepository.create({
    movie: movie._id,
    screen: screen._id,
    theater: theater._id,
    startTime: data.startTime,
    endTime,
    language,
    format: screen.type,
    basePrice: data.basePrice,
  });

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.SHOW_CREATED,
    entity: 'Show',
    entityId: show._id,
    meta: { movie: movie.title, startTime: show.startTime },
    ip,
  });
  return showRepository.findByIdPopulated(show._id);
};

export const updateShow = async (actor, id, data, { ip } = {}) => {
  const show = await requireShow(id);
  assertCanManageTheater(actor, await requireTheater(show.theater));

  if (show.status !== SHOW_STATUS.SCHEDULED || show.startTime <= new Date()) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Only upcoming scheduled shows can be edited');
  }
  await assertNoActiveBookings(show._id);

  const movie = await requireMovie(show.movie);

  if (data.language !== undefined) show.language = matchMovieLanguage(movie, data.language);
  // TODO (Phase 6): when basePrice changes, update the prices of this show's ShowSeats.
  if (data.basePrice !== undefined) show.basePrice = data.basePrice;

  if (data.startTime !== undefined) {
    assertValidStartTime(data.startTime);
    const endTime = computeEndTime(data.startTime, movie);
    await assertNoOverlap(show.screen, data.startTime, endTime, show._id);
    show.startTime = data.startTime;
    show.endTime = endTime;
  }

  await show.save();

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.SHOW_UPDATED,
    entity: 'Show',
    entityId: show._id,
    meta: { fields: Object.keys(data) },
    ip,
  });
  return showRepository.findByIdPopulated(show._id);
};

export const cancelShow = async (actor, id, { ip } = {}) => {
  const show = await requireShow(id);
  assertCanManageTheater(actor, await requireTheater(show.theater));

  if (show.status !== SHOW_STATUS.SCHEDULED) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Only scheduled shows can be cancelled');
  }
  // TODO (Phase 7): instead of blocking, cancel the bookings and refund them.
  await assertNoActiveBookings(show._id);

  show.status = SHOW_STATUS.CANCELLED;
  await show.save();

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.SHOW_CANCELLED,
    entity: 'Show',
    entityId: show._id,
    ip,
  });
  return showRepository.findByIdPopulated(show._id);
};
