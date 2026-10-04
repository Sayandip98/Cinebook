import { Router } from 'express';
import * as theaterController from '../controllers/theater.controller.js';
import * as screenController from '../controllers/screen.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly, staffOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { objectIdParamSchema } from '../validators/common.validator.js';
import {
  createTheaterSchema,
  listTheatersSchema,
  manageTheatersSchema,
  updateTheaterSchema,
} from '../validators/theater.validator.js';
import { createScreenSchema, theaterIdParamSchema } from '../validators/screen.validator.js';

const router = Router();

router.get('/', validate(listTheatersSchema), theaterController.listTheaters);
router.get('/cities', theaterController.listCities);
router.get(
  '/manage',
  protect,
  staffOnly,
  validate(manageTheatersSchema),
  theaterController.listManageable,
);
router.post(
  '/',
  protect,
  adminOnly,
  validate(createTheaterSchema),
  theaterController.createTheater,
);

router.get('/:id', validate(objectIdParamSchema), theaterController.getTheater);
router.patch(
  '/:id',
  protect,
  staffOnly,
  validate(updateTheaterSchema),
  theaterController.updateTheater,
);
router.delete(
  '/:id',
  protect,
  adminOnly,
  validate(objectIdParamSchema),
  theaterController.deactivateTheater,
);

router.get('/:theaterId/screens', validate(theaterIdParamSchema), screenController.listScreens);
router.post(
  '/:theaterId/screens',
  protect,
  staffOnly,
  validate(createScreenSchema),
  screenController.createScreen,
);

export default router;
