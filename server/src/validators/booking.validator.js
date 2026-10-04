import Joi from 'joi';
import { BOOKING_STATUS_VALUES } from '../constants/bookingStatus.js';
import { MAX_SEATS_PER_BOOKING } from '../constants/booking.js';
import { objectId, paginationKeys } from './common.validator.js';

const seatLabel = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z]\d{1,2}$/)
  .messages({ 'string.pattern.base': 'Seat label must look like A1 or J12' });

export const createBookingSchema = {
  body: Joi.object({
    showId: objectId,
    seats: Joi.array().items(seatLabel).min(1).max(MAX_SEATS_PER_BOOKING).unique().required(),
  }),
};

export const listMyBookingsSchema = {
  query: Joi.object({
    ...paginationKeys(),
    status: Joi.string().valid(...BOOKING_STATUS_VALUES),
  }),
};
