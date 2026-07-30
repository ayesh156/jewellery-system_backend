import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as companyController from '../controllers/company.controller.js';

const router = Router();

router.get('/', asyncHandler(companyController.get));
router.put('/', asyncHandler(companyController.update));

export default router;