import Joi from 'joi';
import { REVIEW_SORT_KEYS } from '../constants/catalogSort.js';
import { objectId, paginationKeys } from './common.validator.js';

const DEFAULT_REVIEW_LIMIT = 5;

const rating = Joi.number().integer().min(1).max(5);
const comment = Joi.string().trim().allow('').max(1000);

export const listReviewsSchema = {
  params: Joi.object({ id: objectId }),
  query: Joi.object({
    ...paginationKeys(DEFAULT_REVIEW_LIMIT),
    sort: Joi.string()
      .valid(...REVIEW_SORT_KEYS)
      .default('newest'),
  }),
};

export const createReviewSchema = {
  params: Joi.object({ id: objectId }),
  body: Joi.object({ rating: rating.required(), comment }),
};

export const updateReviewSchema = {
  params: Joi.object({ id: objectId }),
  body: Joi.object({ rating, comment }).min(1),
};
