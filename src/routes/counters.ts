import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as countersController from '../controllers/counters.controller.ts';

const router = Router();

router.get('/', asyncHandler(countersController.list));
router.post('/next', asyncHandler(countersController.getNext));
router.post('/init-shop', asyncHandler(countersController.initShop));
router.put('/:entityType', asyncHandler(countersController.update));

export default router;