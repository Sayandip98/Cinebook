import Joi from 'joi';
import { objectId } from './common.validator.js';

export const createOrderSchema = {
  body: Joi.object({ bookingId: objectId }),
};

export const verifyPaymentSchema = {
  body: Joi.object({
    razorpay_order_id: Joi.string()
      .pattern(/^order_[A-Za-z0-9]+$/)
      .max(64)
      .required(),
    razorpay_payment_id: Joi.string()
      .pattern(/^pay_[A-Za-z0-9]+$/)
      .max(64)
      .required(),
    razorpay_signature: Joi.string().hex().length(64).required(),
  }),
};
