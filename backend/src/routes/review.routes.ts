import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema } from '../validators/review.validator.js';

const router = Router();

router.get('/college/:collegeId', reviewController.listCollegeReviews);
router.post('/', protect, validate({ body: createReviewSchema }), reviewController.createReview);

export default router;
