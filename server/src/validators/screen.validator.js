import Joi from 'joi';
import { SCREEN_TYPE_VALUES } from '../constants/screenType.js';
import { objectId } from './common.validator.js';

const seatLayout = Joi.object({
  rows: Joi.number().integer().min(1).max(26).required(),
  columns: Joi.number().integer().min(1).max(30).required(),
  categories: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(1).max(30).required(),
        fromRow: Joi.number().integer().min(1).max(26).required(),
        toRow: Joi.number().integer().min(1).max(26).required(),
        priceMultiplier: Joi.number().min(0.1).max(10).default(1),
      }),
    )
    .min(1)
    .max(10)
    .required(),
  blockedSeats: Joi.array()
    .items(Joi.string().pattern(/^[A-Z]\d{1,2}$/))
    .max(200)
    .unique()
    .default([]),
});

export const createScreenSchema = {
  params: Joi.object({ theaterId: objectId }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(60).required(),
    type: Joi.string().valid(...SCREEN_TYPE_VALUES),
    seatLayout: seatLayout.required(),
  }),
};

export const updateScreenSchema = {
  params: Joi.object({ id: objectId }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(60),
    type: Joi.string().valid(...SCREEN_TYPE_VALUES),
    seatLayout,
    isActive: Joi.boolean(),
  }).min(1),
};

export const theaterIdParamSchema = {
  params: Joi.object({ theaterId: objectId }),
};
