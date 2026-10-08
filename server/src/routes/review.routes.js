import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { objectIdParamSchema } from '../validators/common.validator.js';
import { updateReviewSchema } from '../validators/review.validator.js';

const router = Router();

router.use(protect);

router.patch('/:id', validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', validate(objectIdParamSchema), reviewController.deleteReview);

export default router;
