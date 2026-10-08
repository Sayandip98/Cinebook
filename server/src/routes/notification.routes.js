import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { objectIdParamSchema } from '../validators/common.validator.js';
import { listNotificationsSchema } from '../validators/notification.validator.js';

const router = Router();

router.use(protect);

router.get('/', validate(listNotificationsSchema), notificationController.listNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', validate(objectIdParamSchema), notificationController.markRead);
router.delete('/:id', validate(objectIdParamSchema), notificationController.removeNotification);

export default router;
