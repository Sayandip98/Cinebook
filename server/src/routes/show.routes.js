import { Router } from 'express';
import * as showController from '../controllers/show.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { staffOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { objectIdParamSchema } from '../validators/common.validator.js';
import {
  createShowSchema,
  listShowsSchema,
  updateShowSchema,
} from '../validators/show.validator.js';

const router = Router();

router.get('/', validate(listShowsSchema), showController.listShows);
router.get('/:id', validate(objectIdParamSchema), showController.getShow);
router.get('/:id/seats', validate(objectIdParamSchema), showController.getShowSeats);

router.post('/', protect, staffOnly, validate(createShowSchema), showController.createShow);
router.patch('/:id', protect, staffOnly, validate(updateShowSchema), showController.updateShow);
router.delete('/:id', protect, staffOnly, validate(objectIdParamSchema), showController.cancelShow);

export default router;
