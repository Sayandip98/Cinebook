import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { protect, requireVerified } from '../middlewares/auth.middleware.js';
import { bookingLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { objectIdParamSchema } from '../validators/common.validator.js';
import { createBookingSchema, listMyBookingsSchema } from '../validators/booking.validator.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  requireVerified,
  bookingLimiter,
  validate(createBookingSchema),
  bookingController.createBooking,
);
router.get('/my', validate(listMyBookingsSchema), bookingController.listMyBookings);
router.get('/:id', validate(objectIdParamSchema), bookingController.getBooking);
router.post('/:id/cancel', validate(objectIdParamSchema), bookingController.cancelBooking);

export default router;
