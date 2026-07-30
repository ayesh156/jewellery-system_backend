import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as pawningTermsController from '../controllers/pawningTerms.controller.js';

const router = Router();

router.get('/', asyncHandler(pawningTermsController.getAll));
router.get('/flat', asyncHandler(pawningTermsController.getFlat));
router.post('/', asyncHandler(pawningTermsController.create));
router.put('/:groupId', asyncHandler(pawningTermsController.update));
router.delete('/:groupId', asyncHandler(pawningTermsController.remove));

export default router;