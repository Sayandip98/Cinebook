import Joi from 'joi';
import { paginationKeys } from './common.validator.js';

export const listNotificationsSchema = {
  query: Joi.object({
    ...paginationKeys(),
    unread: Joi.boolean(),
  }),
};
