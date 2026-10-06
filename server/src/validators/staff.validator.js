import Joi from 'joi';
import { BOOKING_STATUS_VALUES } from '../constants/bookingStatus.js';
import { SHOW_STATUS_VALUES } from '../constants/showStatus.js';
import { objectId, paginationKeys } from './common.validator.js';

export const staffBookingsSchema = {
  query: Joi.object({
    ...paginationKeys(),
    status: Joi.string().valid(...BOOKING_STATUS_VALUES),
    search: Joi.string()
      .trim()
      .max(20)
      .pattern(/^[A-Za-z0-9]+$/),
  }),
};

export const staffShowsSchema = {
  query: Joi.object({
    ...paginationKeys(),
    status: Joi.string().valid(...SHOW_STATUS_VALUES),
    when: Joi.string().valid('upcoming', 'past'),
    theaterId: objectId.optional(),
  }),
};

export const checkInSchema = {
  body: Joi.object({
    bookingCode: Joi.string()
      .trim()
      .uppercase()
      .pattern(/^[A-Z0-9]{6,20}$/)
      .required(),
  }),
};

export const adminRefundsSchema = {
  query: Joi.object({ ...paginationKeys() }),
};
