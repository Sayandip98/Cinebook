import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { couponLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createCouponSchema,
  listCouponsSchema,
  updateCouponSchema,
  validateCouponSchema,
} from '../validators/coupon.validator.js';

const router = Router();

router.use(protect);

router.get('/available', couponController.listAvailable);
router.get(
  '/validate',
  couponLimiter,
  validate(validateCouponSchema),
  couponController.validateCoupon,
);

router.get('/manage', adminOnly, validate(listCouponsSchema), couponController.listForAdmin);
router.post('/', adminOnly, validate(createCouponSchema), couponController.createCoupon);
router.patch('/:id', adminOnly, validate(updateCouponSchema), couponController.updateCoupon);

export default router;
