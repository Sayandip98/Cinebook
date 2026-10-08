import Joi from 'joi';
import { COUPON_TYPE, COUPON_TYPE_VALUES } from '../constants/couponType.js';
import { objectId, paginationKeys } from './common.validator.js';

const MAX_AMOUNT = 100000;

const code = Joi.string()
  .trim()
  .uppercase()
  .pattern(/^[A-Z0-9_-]{3,20}$/)
  .messages({ 'string.pattern.base': 'Coupon code must be 3-20 letters, digits, _ or -' });

const amount = Joi.number().min(0).max(MAX_AMOUNT);

export const validateCouponSchema = {
  query: Joi.object({ code: code.required(), subtotal: amount.required() }),
};

export const listCouponsSchema = {
  query: Joi.object({
    ...paginationKeys(),
    search: Joi.string().trim().max(20),
    isActive: Joi.boolean(),
  }),
};

export const createCouponSchema = {
  body: Joi.object({
    code: code.required(),
    description: Joi.string().trim().max(200),
    type: Joi.string()
      .valid(...COUPON_TYPE_VALUES)
      .required(),
    value: Joi.number()
      .min(1)
      .required()
      .when('type', {
        is: COUPON_TYPE.PERCENT,
        then: Joi.number().max(100),
        otherwise: Joi.number().max(MAX_AMOUNT),
      }),
    maxDiscount: amount,
    minOrderAmount: amount,
    validFrom: Joi.date().iso().required(),
    validTo: Joi.date().iso().greater(Joi.ref('validFrom')).required(),
    usageLimit: Joi.number().integer().min(1),
    perUserLimit: Joi.number().integer().min(1).max(100),
  }),
};

export const updateCouponSchema = {
  params: Joi.object({ id: objectId }),
  body: Joi.object({
    description: Joi.string().trim().allow('').max(200),
    value: Joi.number().min(1).max(MAX_AMOUNT),
    maxDiscount: amount.allow(null),
    minOrderAmount: amount,
    validFrom: Joi.date().iso(),
    validTo: Joi.date().iso(),
    usageLimit: Joi.number().integer().min(1).allow(null),
    perUserLimit: Joi.number().integer().min(1).max(100),
    isActive: Joi.boolean(),
  }).min(1),
};
