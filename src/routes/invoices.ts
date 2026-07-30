import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as invoicesController from '../controllers/invoices.controller.js';

const router = Router();

router.get('/', asyncHandler(invoicesController.list));
router.get('/:id', asyncHandler(invoicesController.getById));
router.post('/', asyncHandler(invoicesController.create));
router.put('/:id', asyncHandler(invoicesController.update));
router.post('/:id/payments', asyncHandler(invoicesController.addPayment));
router.delete('/:id', asyncHandler(invoicesController.remove));

export default router;