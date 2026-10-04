import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { MOVIE_SORT_OPTIONS } from '../constants/catalogSort.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { exactMatchInsensitive } from '../utils/queryHelpers.js';
import { detectImageType } from '../utils/imageSignature.js';
import * as movieRepository from '../repositories/movie.repository.js';
import * as showRepository from '../repositories/show.repository.js';
import * as auditService from './audit.service.js';
import * as uploadService from './upload.service.js';

const POSTER_FOLDER = 'cinebook/posters';
const POSTER_TRANSFORMATION = [
  { width: 800, height: 1200, crop: 'limit' },
  { quality: 'auto', fetch_format: 'auto' },
];

const requireMovie = async (id) => {
  const movie = await movieRepository.findById(id);
  if (!movie) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Movie not found');
  return movie;
};

const buildMovieFilter = ({ search, genre, language, status }) => {
  const filter = {};
  if (status) filter.status = status;
  if (genre) filter.genres = exactMatchInsensitive(genre);
  if (language) filter.languages = exactMatchInsensitive(language);
  // Whole-word match using the text index on title and description.
  if (search) filter.$text = { $search: search };
  return filter;
};

export const listMovies = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildMovieFilter(query);
  const sort = MOVIE_SORT_OPTIONS[query.sort] ?? MOVIE_SORT_OPTIONS.newest;

  const [movies, total] = await Promise.all([
    movieRepository.findPaginated(filter, { sort, skip, limit }),
    movieRepository.count(filter),
  ]);

  return { movies, meta: buildPaginationMeta({ page, limit, total }) };
};

export const getMovieBySlug = async (slug) => {
  const movie = await movieRepository.findBySlug(slug);
  if (!movie) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Movie not found');
  return movie;
};

export const createMovie = async (actor, data, { ip } = {}) => {
  const movie = await movieRepository.create(data);

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.MOVIE_CREATED,
    entity: 'Movie',
    entityId: movie._id,
    meta: { title: movie.title },
    ip,
  });
  return movie;
};

// Loads the document and calls save(), so model hooks (slug) and validators run.
export const updateMovie = async (actor, id, data, { ip } = {}) => {
  const movie = await requireMovie(id);
  movie.set(data);
  await movie.save();

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.MOVIE_UPDATED,
    entity: 'Movie',
    entityId: movie._id,
    meta: { fields: Object.keys(data) },
    ip,
  });
  return movie;
};

export const updatePoster = async (actor, id, file, { ip } = {}) => {
  if (!file) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Poster image is required');
  if (!detectImageType(file.buffer)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'File is not a valid image');
  }

  const movie = await requireMovie(id);
  const previousPublicId = movie.poster?.publicId;

  const uploaded = await uploadService.uploadImage(file.buffer, {
    folder: POSTER_FOLDER,
    transformation: POSTER_TRANSFORMATION,
  });

  try {
    movie.poster = uploaded;
    await movie.save();
  } catch (error) {
    await uploadService.deleteImage(uploaded.publicId);
    throw error;
  }

  await uploadService.deleteImage(previousPublicId);
  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.MOVIE_POSTER_UPDATED,
    entity: 'Movie',
    entityId: movie._id,
    ip,
  });
  return movie;
};

export const deleteMovie = async (actor, id, { ip } = {}) => {
  const movie = await requireMovie(id);

  if (await showRepository.existsForMovie(movie._id)) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      'This movie has shows. Set its status to ENDED instead of deleting it.',
    );
  }

  await movieRepository.deleteById(movie._id);
  await uploadService.deleteImage(movie.poster?.publicId);
  await uploadService.deleteImage(movie.banner?.publicId);

  await auditService.record({
    actorId: actor._id,
    action: AUDIT_ACTIONS.MOVIE_DELETED,
    entity: 'Movie',
    entityId: movie._id,
    meta: { title: movie.title },
    ip,
  });
};
