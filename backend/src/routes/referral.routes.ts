import { Router } from 'express';
import * as referralController from '../controllers/referral.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.get('/track/:code', referralController.trackClick);
router.get('/analytics/me', protect, restrictTo('ambassador'), referralController.myAnalytics);
router.patch('/:id/approve', protect, restrictTo('admin'), referralController.approveReferral);

export default router;
