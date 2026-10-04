import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { objectIdParamSchema } from '../validators/common.validator.js';
import {
  adminListUsersSchema,
  changeRoleSchema,
  changeStatusSchema,
} from '../validators/user.validator.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/users', validate(adminListUsersSchema), adminController.listUsers);
router.get('/users/:id', validate(objectIdParamSchema), adminController.getUser);
router.patch('/users/:id/role', validate(changeRoleSchema), adminController.changeRole);
router.patch('/users/:id/status', validate(changeStatusSchema), adminController.changeStatus);

export default router;
