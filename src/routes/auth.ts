import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', asyncHandler(authController.login));
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.put('/change-password', authenticate, asyncHandler(authController.changePassword));
router.put('/preferences', authenticate, asyncHandler(authController.updatePreferences));

export default router;