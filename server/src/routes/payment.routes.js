import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect, requireVerified } from '../middlewares/auth.middleware.js';
import { bookingLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validator.js';

const router = Router();

router.use(protect);

router.post(
  '/orders',
  requireVerified,
  bookingLimiter,
  validate(createOrderSchema),
  paymentController.createOrder,
);
router.post('/verify', validate(verifyPaymentSchema), paymentController.verifyPayment);

export default router;
