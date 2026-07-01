import { Router } from 'express';
import * as verificationController from '../controllers/verification.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { idUpload } from '../middleware/upload.js';
import {
  startEmailSchema,
  confirmEmailSchema,
} from '../validators/verification.validator.js';

const router = Router();

router.use(protect);

router.get('/me', verificationController.myVerification);
router.get('/files', verificationController.streamFile);
router.post(
  '/email/request',
  authLimiter,
  validate({ body: startEmailSchema }),
  verificationController.requestEmailOtp,
);
router.post(
  '/email/confirm',
  authLimiter,
  validate({ body: confirmEmailSchema }),
  verificationController.confirmEmailOtp,
);
router.post('/id', idUpload, verificationController.uploadIds);

export default router;
