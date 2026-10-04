import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import * as movieService from '../services/movie.service.js';

const getMeta = (req) => ({ ip: req.ip });

export const listMovies = asyncHandler(async (req, res) => {
  const { movies, meta } = await movieService.listMovies(req.validated.query);
  ApiResponse.send(res, { data: { movies }, meta });
});

export const getMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.getMovieBySlug(req.validated.params.slug);
  ApiResponse.send(res, { data: { movie } });
});

export const createMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.createMovie(req.user, req.validated.body, getMeta(req));
  ApiResponse.send(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Movie created',
    data: { movie },
  });
});

export const updateMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.updateMovie(
    req.user,
    req.validated.params.id,
    req.validated.body,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'Movie updated', data: { movie } });
});

export const updatePoster = asyncHandler(async (req, res) => {
  const movie = await movieService.updatePoster(
    req.user,
    req.validated.params.id,
    req.file,
    getMeta(req),
  );
  ApiResponse.send(res, { message: 'Poster updated', data: { movie } });
});

export const deleteMovie = asyncHandler(async (req, res) => {
  await movieService.deleteMovie(req.user, req.validated.params.id, getMeta(req));
  ApiResponse.send(res, { message: 'Movie deleted' });
});
