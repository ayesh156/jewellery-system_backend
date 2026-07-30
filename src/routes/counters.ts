import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as countersController from '../controllers/counters.controller.js';

const router = Router();

router.get('/', asyncHandler(countersController.list));
router.post('/next', asyncHandler(countersController.getNext));
router.post('/init-shop', asyncHandler(countersController.initShop));
router.put('/:entityType', asyncHandler(countersController.update));

export default router;