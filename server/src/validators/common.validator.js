import Joi from 'joi';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../utils/pagination.js';

export const objectId = Joi.string().hex().length(24).required();

export const objectIdParamSchema = {
  params: Joi.object({ id: objectId }),
};

export const slugParamSchema = {
  params: Joi.object({
    slug: Joi.string()
      .trim()
      .lowercase()
      .max(250)
      .pattern(/^[a-z0-9-]+$/)
      .required(),
  }),
};

export const paginationKeys = (defaultLimit = DEFAULT_LIMIT) => ({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(defaultLimit),
});
