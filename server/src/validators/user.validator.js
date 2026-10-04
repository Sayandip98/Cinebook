import Joi from 'joi';
import { ROLE_VALUES } from '../constants/roles.js';
import { USER_SORT_KEYS } from '../constants/userSort.js';
import { DEFAULT_LIMIT, MAX_LIMIT } from '../utils/pagination.js';
import { objectId } from './common.validator.js';

export const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(60),
    phone: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .messages({ 'string.pattern.base': 'Phone number is invalid' }),
  }).min(1),
};

export const adminListUsersSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
    search: Joi.string().trim().max(100),
    role: Joi.string().valid(...ROLE_VALUES),
    isActive: Joi.boolean(),
    isVerified: Joi.boolean(),
    sort: Joi.string()
      .valid(...USER_SORT_KEYS)
      .default('newest'),
  }),
};

export const changeRoleSchema = {
  params: Joi.object({ id: objectId }),
  body: Joi.object({
    role: Joi.string()
      .valid(...ROLE_VALUES)
      .required(),
  }),
};

export const changeStatusSchema = {
  params: Joi.object({ id: objectId }),
  body: Joi.object({ isActive: Joi.boolean().required() }),
};
