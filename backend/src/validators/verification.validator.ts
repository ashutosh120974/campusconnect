import { z } from 'zod';

export const startEmailSchema = z.object({
  collegeEmail: z.string().email(),
});

export const confirmEmailSchema = z.object({
  collegeEmail: z.string().email(),
  code: z.string().length(6),
});

export const reviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'reupload']),
  note: z.string().max(1000).optional(),
});

export const listQuerySchema = z.object({
  decision: z.enum(['pending', 'ai_verified', 'approved', 'rejected', 'reupload']).optional(),
  step: z.enum(['email', 'id_upload', 'ocr', 'admin_review', 'complete']).optional(),
});
