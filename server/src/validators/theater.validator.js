import Joi from 'joi';
import { THEATER_SORT_KEYS } from '../constants/catalogSort.js';
import { objectId, paginationKeys } from './common.validator.js';

const DEFAULT_RADIUS_KM = 25;
const MAX_RADIUS_KM = 100;

const latitude = Joi.number().min(-90).max(90);
const longitude = Joi.number().min(-180).max(180);
const amenities = Joi.array().items(Joi.string().trim().min(1).max(50)).max(20).unique();

const listQueryKeys = {
  ...paginationKeys(),
  search: Joi.string().trim().max(100),
  city: Joi.string().trim().max(60),
  lat: latitude,
  lng: longitude,
  radiusKm: Joi.number().min(1).max(MAX_RADIUS_KM).default(DEFAULT_RADIUS_KM),
  sort: Joi.string()
    .valid(...THEATER_SORT_KEYS)
    .default('name_asc'),
};

export const listTheatersSchema = {
  query: Joi.object(listQueryKeys).and('lat', 'lng'),
};

export const manageTheatersSchema = {
  query: Joi.object({ ...listQueryKeys, isActive: Joi.boolean() }).and('lat', 'lng'),
};

export const createTheaterSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(120).required(),
    city: Joi.string().trim().min(1).max(60).required(),
    address: Joi.string().trim().min(1).max(250).required(),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .messages({ 'string.pattern.base': 'Pincode must be 6 digits' }),
    latitude: latitude.required(),
    longitude: longitude.required(),
    amenities,
    manager: objectId.optional(),
    isActive: Joi.boolean(),
  }),
};

export const updateTheaterSchema = {
  params: Joi.object({ id: objectId }),
  body: Joi.object({
    name: Joi.string().trim().min(1).max(120),
    city: Joi.string().trim().min(1).max(60),
    address: Joi.string().trim().min(1).max(250),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .messages({ 'string.pattern.base': 'Pincode must be 6 digits' }),
    latitude,
    longitude,
    amenities,
    manager: objectId.optional(),
    isActive: Joi.boolean(),
  })
    .min(1)
    .and('latitude', 'longitude'),
};
