import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  registerSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/otp/request', authLimiter, validate({ body: otpRequestSchema }), authController.requestOtp);
router.post('/otp/verify', authLimiter, validate({ body: otpVerifySchema }), authController.confirmOtp);
router.get('/me', protect, authController.me);

export default router;
