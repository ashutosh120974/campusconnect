import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { toFileUrl } from '../services/storage.service.js';
import {
  listVerifications,
  reviewVerification,
  type ReviewAction,
} from '../services/verification.service.js';
import { User } from '../models/User.js';
import { College } from '../models/College.js';
import { StudentVerification } from '../models/StudentVerification.js';

function withFileUrls<T extends { idFrontUrl?: string; idBackUrl?: string; selfieUrl?: string }>(
  v: T,
): T {
  return {
    ...v,
    idFrontUrl: v.idFrontUrl ? toFileUrl(v.idFrontUrl) : undefined,
    idBackUrl: v.idBackUrl ? toFileUrl(v.idBackUrl) : undefined,
    selfieUrl: v.selfieUrl ? toFileUrl(v.selfieUrl) : undefined,
  };
}

export const verificationQueue = catchAsync(async (req: Request, res: Response) => {
  const { decision, step } = req.query as { decision?: string; step?: string };
  const items = await listVerifications({ decision, step });
  sendSuccess(res, 200, { verifications: items.map(withFileUrls) });
});

export const decideVerification = catchAsync(async (req: Request, res: Response) => {
  const { action, note } = req.body as { action: ReviewAction; note?: string };
  const verification = await reviewVerification(req.user!.id, req.params.id, action, note);
  sendSuccess(res, 200, { verification: verification.toObject() }, {
    message: `Verification ${action}d`,
  });
});

export const stats = catchAsync(async (_req: Request, res: Response) => {
  const [users, ambassadors, colleges, pendingReviews, aiVerified] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'ambassador' }),
    College.countDocuments(),
    StudentVerification.countDocuments({ decision: { $in: ['pending', 'ai_verified'] }, step: 'admin_review' }),
    StudentVerification.countDocuments({ decision: 'ai_verified' }),
  ]);

  sendSuccess(res, 200, {
    users,
    ambassadors,
    colleges,
    pendingReviews,
    aiVerified,
  });
});
