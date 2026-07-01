import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listQuerySchema, reviewSchema } from '../validators/verification.validator.js';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', adminController.stats);
router.get(
  '/verifications',
  validate({ query: listQuerySchema }),
  adminController.verificationQueue,
);
router.patch(
  '/verifications/:id',
  validate({ body: reviewSchema }),
  adminController.decideVerification,
);

export default router;
