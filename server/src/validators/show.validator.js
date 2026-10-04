import Joi from 'joi';
import { SCREEN_TYPE_VALUES } from '../constants/screenType.js';
import { SHOW_SORT_KEYS } from '../constants/catalogSort.js';
import { objectId, paginationKeys } from './common.validator.js';

const MAX_BASE_PRICE = 5000;
const DEFAULT_SHOW_LIMIT = 20;

const calendarDate = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value, helpers) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    const isRealDate =
      !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    return isRealDate ? value : helpers.error('any.invalid');
  })
  .messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
    'any.invalid': 'Date is not a valid calendar date',
  });

export const listShowsSchema = {
  query: Joi.object({
    ...paginationKeys(DEFAULT_SHOW_LIMIT),
    movieId: objectId.optional(),
    theaterId: objectId.optional(),
    city: Joi.string().trim().max(60),
    date: calendarDate,
    format: Joi.string().valid(...SCREEN_TYPE_VALUES),
    language: Joi.string().trim().max(40),
    sort: Joi.string()
      .valid(...SHOW_SORT_KEYS)
      .default('time_asc'),
  }),
};

export const createShowSchema = {
  body: Joi.object({
    movie: objectId,
    screen: objectId,
    startTime: Joi.date().iso().required(),
    language: Joi.string().trim().min(1).max(40).required(),
    basePrice: Joi.number().min(0).max(MAX_BASE_PRICE).required(),
  }),
};

export const updateShowSchema = {
  params: Joi.object({ id: objectId }),
  body: Joi.object({
    startTime: Joi.date().iso(),
    language: Joi.string().trim().min(1).max(40),
    basePrice: Joi.number().min(0).max(MAX_BASE_PRICE),
  }).min(1),
};
