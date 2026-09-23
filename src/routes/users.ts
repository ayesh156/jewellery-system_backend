import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { authenticate, requireRole } from '../middleware/auth.ts';
import * as usersController from '../controllers/users.controller.ts';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', asyncHandler(usersController.list));
router.get('/:id', asyncHandler(usersController.getById));
router.post('/', asyncHandler(usersController.create));
router.put('/:id', asyncHandler(usersController.update));
router.delete('/:id', asyncHandler(usersController.remove));

export default router;