import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['student', 'ambassador']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const otpRequestSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['email_verification', 'login', 'college_email']).default('email_verification'),
});

export const otpVerifySchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['email_verification', 'login', 'college_email']).default('email_verification'),
  code: z.string().length(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
