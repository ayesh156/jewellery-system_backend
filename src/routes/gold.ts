import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as goldController from '../controllers/gold.controller.js';

const router = Router();

router.get('/rates', asyncHandler(goldController.getRates));
router.put('/rates/:id', asyncHandler(goldController.updateRate));
router.get('/types', asyncHandler(goldController.getTypes));
router.post('/types', asyncHandler(goldController.createType));
router.put('/types/:id', asyncHandler(goldController.updateType));
router.delete('/types/:id', asyncHandler(goldController.deleteType));

export default router;