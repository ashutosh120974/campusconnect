import { z } from 'zod';

const ratingScale = z.number().int().min(1).max(5);

export const createReviewSchema = z.object({
  college: z.string().length(24),
  ratings: z.object({
    academics: ratingScale,
    faculty: ratingScale,
    hostel: ratingScale,
    placement: ratingScale,
    campusLife: ratingScale,
    infrastructure: ratingScale,
  }),
  title: z.string().max(160).optional(),
  body: z.string().max(4000).optional(),
});
