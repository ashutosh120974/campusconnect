import { Router } from 'express';
import authRoutes from './auth.routes.js';
import collegeRoutes from './college.routes.js';
import scholarshipRoutes from './scholarship.routes.js';
import ambassadorRoutes from './ambassador.routes.js';
import reviewRoutes from './review.routes.js';
import communityRoutes from './community.routes.js';
import referralRoutes from './referral.routes.js';
import verificationRoutes from './verification.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/colleges', collegeRoutes);
router.use('/scholarships', scholarshipRoutes);
router.use('/ambassadors', ambassadorRoutes);
router.use('/reviews', reviewRoutes);
router.use('/community', communityRoutes);
router.use('/referrals', referralRoutes);
router.use('/verification', verificationRoutes);
router.use('/admin', adminRoutes);

export default router;
