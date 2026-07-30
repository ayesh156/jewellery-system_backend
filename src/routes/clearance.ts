import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as clearanceController from '../controllers/clearance.controller.js';

const router = Router();

router.get('/', asyncHandler(clearanceController.list));
router.get('/:id', asyncHandler(clearanceController.getById));
router.post('/', asyncHandler(clearanceController.create));
router.put('/:id', asyncHandler(clearanceController.update));
router.post('/:id/payments', asyncHandler(clearanceController.addPayment));
router.post('/:id/redeem', asyncHandler(clearanceController.redeem));
router.delete('/:id', asyncHandler(clearanceController.remove));

export default router;