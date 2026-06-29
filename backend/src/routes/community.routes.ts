import { Router } from 'express';
import * as communityController from '../controllers/community.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPostSchema } from '../validators/community.validator.js';

const router = Router();

router.get('/', communityController.listPosts);
router.get('/:id', communityController.getPost);
router.post('/', protect, validate({ body: createPostSchema }), communityController.createPost);
router.post('/:id/like', protect, communityController.toggleLike);

export default router;
