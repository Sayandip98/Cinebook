import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadAvatar } from '../middlewares/upload.middleware.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

router.use(protect);

router.get('/me', userController.getProfile);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.patch('/me/avatar', uploadAvatar, userController.updateAvatar);
router.delete('/me/avatar', userController.removeAvatar);

export default router;
