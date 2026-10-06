import { Router } from 'express';
import * as manageController from '../controllers/manage.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { staffOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  checkInSchema,
  staffBookingsSchema,
  staffShowsSchema,
} from '../validators/staff.validator.js';

const router = Router();

router.use(protect, staffOnly);

router.get('/stats', manageController.getStats);
router.get('/bookings', validate(staffBookingsSchema), manageController.listBookings);
router.get('/shows', validate(staffShowsSchema), manageController.listShows);
router.post('/check-in', validate(checkInSchema), manageController.checkIn);

export default router;
