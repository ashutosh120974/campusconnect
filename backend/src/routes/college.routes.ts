import { Router } from 'express';
import * as collegeController from '../controllers/college.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.get('/', collegeController.listColleges);
router.get('/compare', collegeController.compareColleges);
router.get('/:slug', collegeController.getCollege);

router.post('/', protect, restrictTo('admin'), collegeController.createCollege);
router.patch('/:id', protect, restrictTo('admin'), collegeController.updateCollege);
router.delete('/:id', protect, restrictTo('admin'), collegeController.deleteCollege);

export default router;
