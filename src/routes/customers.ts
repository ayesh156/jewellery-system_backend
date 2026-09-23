import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as customersController from '../controllers/customers.controller.ts';

const router = Router();

router.get('/', asyncHandler(customersController.list));
router.get('/:id', asyncHandler(customersController.getById));
router.post('/', asyncHandler(customersController.create));
router.put('/:id', asyncHandler(customersController.update));
router.delete('/:id', asyncHandler(customersController.remove));

export default router;