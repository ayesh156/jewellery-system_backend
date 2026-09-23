import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as productsController from '../controllers/products.controller.ts';

const router = Router();

router.get('/counts', asyncHandler(productsController.getCounts));
router.get('/', asyncHandler(productsController.list));
router.get('/:id', asyncHandler(productsController.getById));
router.post('/', asyncHandler(productsController.create));
router.put('/:id', asyncHandler(productsController.update));
router.delete('/:id', asyncHandler(productsController.remove));
router.patch('/:id/stock', asyncHandler(productsController.updateStock));

export default router;