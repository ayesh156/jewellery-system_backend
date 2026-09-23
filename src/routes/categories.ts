import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as categoriesController from '../controllers/categories.controller.ts';

const router = Router();

router.get('/', asyncHandler(categoriesController.list));
router.get('/:id', asyncHandler(categoriesController.getById));
router.post('/', asyncHandler(categoriesController.create));
router.put('/:id', asyncHandler(categoriesController.update));
router.delete('/:id', asyncHandler(categoriesController.remove));

export default router;