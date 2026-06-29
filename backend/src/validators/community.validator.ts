import { z } from 'zod';
import { POST_CATEGORIES } from '../models/CommunityPost.js';

export const createPostSchema = z.object({
  title: z.string().min(4).max(200),
  body: z.string().min(4).max(10000),
  category: z.enum(POST_CATEGORIES),
  tags: z.array(z.string().max(40)).max(8).optional(),
  college: z.string().length(24).optional(),
});
