import { Router } from 'express';
import * as screenController from '../controllers/screen.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { staffOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { objectIdParamSchema } from '../validators/common.validator.js';
import { updateScreenSchema } from '../validators/screen.validator.js';

const router = Router();

router.use(protect, staffOnly);

router.patch('/:id', validate(updateScreenSchema), screenController.updateScreen);
router.delete('/:id', validate(objectIdParamSchema), screenController.deactivateScreen);

export default router;
