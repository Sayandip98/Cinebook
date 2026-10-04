import Joi from 'joi';
import { MOVIE_CERTIFICATE_VALUES } from '../constants/movieCertificate.js';
import { MOVIE_STATUS_VALUES } from '../constants/movieStatus.js';
import { MOVIE_SORT_KEYS } from '../constants/catalogSort.js';
import { objectId, paginationKeys } from './common.validator.js';

const tag = Joi.string().trim().min(1).max(40);

const buildMovieBody = ({ required }) => {
  const field = (schema) => (required ? schema.required() : schema);

  return Joi.object({
    title: field(Joi.string().trim().min(1).max(200)),
    description: field(Joi.string().trim().min(1).max(2000)),
    genres: field(Joi.array().items(tag).min(1).max(10).unique()),
    languages: field(Joi.array().items(tag).min(1).max(10).unique()),
    durationMinutes: field(Joi.number().integer().min(1).max(600)),
    releaseDate: field(Joi.date().iso()),
    certificate: field(Joi.string().valid(...MOVIE_CERTIFICATE_VALUES)),
    director: Joi.string().trim().max(100),
    cast: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().min(1).max(100).required(),
          role: Joi.string().trim().max(100),
        }),
      )
      .max(30),
    trailerUrl: Joi.string()
      .trim()
      .uri({ scheme: ['https'] })
      .max(300),
    status: Joi.string().valid(...MOVIE_STATUS_VALUES),
  });
};

export const listMoviesSchema = {
  query: Joi.object({
    ...paginationKeys(),
    search: Joi.string().trim().max(100),
    genre: Joi.string().trim().max(40),
    language: Joi.string().trim().max(40),
    status: Joi.string().valid(...MOVIE_STATUS_VALUES),
    sort: Joi.string()
      .valid(...MOVIE_SORT_KEYS)
      .default('newest'),
  }),
};

export const createMovieSchema = { body: buildMovieBody({ required: true }) };

export const updateMovieSchema = {
  params: Joi.object({ id: objectId }),
  body: buildMovieBody({ required: false }).min(1),
};
