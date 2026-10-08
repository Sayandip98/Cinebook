import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { REVIEW_SORT_OPTIONS } from '../constants/catalogSort.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import * as reviewRepository from '../repositories/review.repository.js';
import * as movieRepository from '../repositories/movie.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as bookingRepository from '../repositories/booking.repository.js';
import * as auditService from './audit.service.js';

const reviewNotFound = () => new ApiError(HTTP_STATUS.NOT_FOUND, 'Review not found');

const requireMovie = async (id) => {
  const movie = await movieRepository.findById(id);
  if (!movie) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Movie not found');
  return movie;
};

// A confirmed booking for a show of this movie that has already started.
const hasWatched = async (userId, movieId) => {
  const showIds = await showRepository.findIdsStartedForMovie(movieId, new Date());
  if (showIds.length === 0) return false;
  return Boolean(await bookingRepository.existsConfirmedForShows(userId, showIds));
};

const refreshMovieRating = async (movieId) => {
  const { average, count } = await reviewRepository.getRatingSummary(movieId);
  await movieRepository.updateRating(movieId, { ratingAverage: average, ratingCount: count });
};

export const listReviews = async (movieId, query) => {
  const movie = await requireMovie(movieId);
  const { page, limit, skip } = parsePagination(query);
  const sort = REVIEW_SORT_OPTIONS[query.sort] ?? REVIEW_SORT_OPTIONS.newest;

  const [reviews, total] = await Promise.all([
    reviewRepository.findPaginatedByMovie(movie._id, { sort, skip, limit }),
    reviewRepository.countByMovie(movie._id),
  ]);

  return { reviews, meta: buildPaginationMeta({ page, limit, total }) };
};

export const getMyReview = async (user, movieId) => {
  const movie = await requireMovie(movieId);
  const [review, watched] = await Promise.all([
    reviewRepository.findByUserAndMovie(user._id, movie._id),
    hasWatched(user._id, movie._id),
  ]);
  return { review, canReview: watched && !review };
};

export const createReview = async (user, movieId, { rating, comment }) => {
  const movie = await requireMovie(movieId);

  if (!(await hasWatched(user._id, movie._id))) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      'You can review a movie after attending a show you booked',
    );
  }
  if (await reviewRepository.findByUserAndMovie(user._id, movie._id)) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'You have already reviewed this movie');
  }

  // The unique (user, movie) index is the final guard against a double submit.
  await reviewRepository.create({
    user: user._id,
    movie: movie._id,
    rating,
    comment: comment || undefined,
  });
  await refreshMovieRating(movie._id);

  return reviewRepository.findByUserAndMovie(user._id, movie._id);
};

export const updateReview = async (user, id, data) => {
  const review = await reviewRepository.findById(id);
  if (!review || String(review.user) !== String(user._id)) throw reviewNotFound();

  review.set(data);
  await review.save();
  await refreshMovieRating(review.movie);

  return reviewRepository.findByIdPopulated(review._id);
};

export const deleteReview = async (actor, id, { ip } = {}) => {
  const review = await reviewRepository.findById(id);
  if (!review) throw reviewNotFound();

  const isOwner = String(review.user) === String(actor._id);
  if (!isOwner && actor.role !== ROLES.ADMIN) throw reviewNotFound();

  await reviewRepository.deleteById(review._id);
  await refreshMovieRating(review.movie);

  if (!isOwner) {
    await auditService.record({
      actorId: actor._id,
      action: AUDIT_ACTIONS.REVIEW_DELETED,
      entity: 'Review',
      entityId: review._id,
      meta: { movie: String(review.movie), author: String(review.user) },
      ip,
    });
  }
};
