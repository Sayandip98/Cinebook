import Show from '../models/show.model.js';
import { SHOW_STATUS } from '../constants/showStatus.js';

const POPULATE = [
  { path: 'movie', select: 'title slug poster durationMinutes certificate languages' },
  { path: 'theater', select: 'name city address' },
  { path: 'screen', select: 'name type' },
];

const upcoming = () => ({ status: SHOW_STATUS.SCHEDULED, endTime: { $gt: new Date() } });

export const create = (data) => Show.create(data);

export const findById = (id) => Show.findById(id);

export const findByIdPopulated = (id) => Show.findById(id).populate(POPULATE);

export const findPaginated = (filter, { sort, skip, limit }) =>
  Show.find(filter).sort(sort).skip(skip).limit(limit).populate(POPULATE);

export const count = (filter) => Show.countDocuments(filter);

// A show conflicts when it starts before the window ends AND ends after the window starts.
export const findOverlapping = (screenId, windowStart, windowEnd, excludeId) => {
  const filter = {
    screen: screenId,
    status: { $ne: SHOW_STATUS.CANCELLED },
    startTime: { $lt: windowEnd },
    endTime: { $gt: windowStart },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return Show.findOne(filter);
};

export const existsUpcomingForScreen = (screenId) =>
  Show.exists({ screen: screenId, ...upcoming() });

export const existsUpcomingForTheater = (theaterId) =>
  Show.exists({ theater: theaterId, ...upcoming() });

export const existsForMovie = (movieId) => Show.exists({ movie: movieId });
