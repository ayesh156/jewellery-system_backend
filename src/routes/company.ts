import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as companyController from '../controllers/company.controller.ts';

const router = Router();

router.get('/', asyncHandler(companyController.get));
router.put('/', asyncHandler(companyController.update));

export default router;