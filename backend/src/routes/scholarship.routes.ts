import { Router } from 'express';
import * as scholarshipController from '../controllers/scholarship.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.get('/', scholarshipController.listScholarships);
router.get('/:slug', scholarshipController.getScholarship);

router.post('/', protect, restrictTo('admin'), scholarshipController.createScholarship);
router.patch('/:id', protect, restrictTo('admin'), scholarshipController.updateScholarship);
router.delete('/:id', protect, restrictTo('admin'), scholarshipController.deleteScholarship);

export default router;
