import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  changePasswordSchema,
  emailOnlySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator.js';
import { objectIdParamSchema } from '../validators/common.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/logout-all', protect, authController.logoutAll);

router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post(
  '/resend-verification',
  authLimiter,
  validate(emailOnlySchema),
  authController.resendVerification,
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(emailOnlySchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.patch(
  '/change-password',
  protect,
  validate(changePasswordSchema),
  authController.changePassword,
);

router.get('/me', protect, authController.getMe);

router.get('/sessions', protect, authController.listSessions);
router.delete(
  '/sessions/:id',
  protect,
  validate(objectIdParamSchema),
  authController.revokeSession,
);

export default router;
