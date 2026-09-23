import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as pawningTermsController from '../controllers/pawningTerms.controller.ts';

const router = Router();

router.get('/', asyncHandler(pawningTermsController.getAll));
router.get('/flat', asyncHandler(pawningTermsController.getFlat));
router.post('/', asyncHandler(pawningTermsController.create));
router.put('/:groupId', asyncHandler(pawningTermsController.update));
router.delete('/:groupId', asyncHandler(pawningTermsController.remove));

export default router;