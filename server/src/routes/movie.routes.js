import { Router } from 'express';
import * as movieController from '../controllers/movie.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadPoster } from '../middlewares/upload.middleware.js';
import { objectIdParamSchema, slugParamSchema } from '../validators/common.validator.js';
import {
  createMovieSchema,
  listMoviesSchema,
  updateMovieSchema,
} from '../validators/movie.validator.js';
import * as reviewController from '../controllers/review.controller.js';
import { createReviewSchema, listReviewsSchema } from '../validators/review.validator.js';

const router = Router();

router.get('/', validate(listMoviesSchema), movieController.listMovies);
router.get('/:slug', validate(slugParamSchema), movieController.getMovie);
router.get('/:id/reviews', validate(listReviewsSchema), reviewController.listReviews);
router.get('/:id/reviews/me', protect, validate(objectIdParamSchema), reviewController.getMyReview);
router.post('/:id/reviews', protect, validate(createReviewSchema), reviewController.createReview);
router.post('/', protect, adminOnly, validate(createMovieSchema), movieController.createMovie);
router.patch(
  '/:id/poster',
  protect,
  adminOnly,
  validate(objectIdParamSchema),
  uploadPoster,
  movieController.updatePoster,
);
router.patch('/:id', protect, adminOnly, validate(updateMovieSchema), movieController.updateMovie);
router.delete(
  '/:id',
  protect,
  adminOnly,
  validate(objectIdParamSchema),
  movieController.deleteMovie,
);

export default router;
