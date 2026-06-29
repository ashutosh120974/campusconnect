import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Referral } from '../models/Referral.js';
import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';

/** Public endpoint hit when a referral link is opened; increments click count. */
export const trackClick = catchAsync(async (req: Request, res: Response) => {
  const code = req.params.code;
  const ambassador = await User.findOne({ 'ambassador.referralCode': code }).select('_id');
  if (!ambassador) throw ApiError.notFound('Invalid referral code');

  await Referral.findOneAndUpdate(
    { ambassador: ambassador._id, code, status: 'clicked', student: { $exists: false } },
    { $inc: { clicks: 1 }, $setOnInsert: { ambassador: ambassador._id, code } },
    { upsert: true, new: true },
  );

  sendSuccess(res, 200, { ok: true });
});

/** Aggregated analytics for the logged-in ambassador. */
export const myAnalytics = catchAsync(async (req: Request, res: Response) => {
  const ambassadorId = req.user!.id;
  const referrals = await Referral.find({ ambassador: ambassadorId });

  const clicks = referrals.reduce((sum, r) => sum + r.clicks, 0);
  const applications = referrals.filter((r) => r.status === 'applied').length;
  const admissions = referrals.filter((r) => r.status === 'admitted').length;

  const earningsAgg = await Transaction.aggregate<{ _id: string; total: number }>([
    { $match: { user: req.user!.id, status: 'completed' } },
    { $group: { _id: '$type', total: { $sum: '$amountInr' } } },
  ]);
  const earnings = earningsAgg.reduce<Record<string, number>>((acc, row) => {
    acc[row._id] = row.total;
    return acc;
  }, {});

  sendSuccess(res, 200, {
    clicks,
    applications,
    admissions,
    commissionEarnedInr: earnings.commission ?? 0,
    withdrawnInr: earnings.withdrawal ?? 0,
    referrals,
  });
});

/** Admin approves a referral, marking it admitted and crediting commission. */
export const approveReferral = catchAsync(async (req: Request, res: Response) => {
  const { commissionInr } = req.body as { commissionInr?: number };
  const referral = await Referral.findById(req.params.id);
  if (!referral) throw ApiError.notFound('Referral not found');

  referral.status = 'admitted';
  referral.approvedByAdmin = true;
  referral.commissionInr = commissionInr ?? referral.commissionInr;
  await referral.save();

  await Transaction.create({
    user: referral.ambassador,
    type: 'commission',
    status: 'completed',
    amountInr: referral.commissionInr,
    referral: referral._id,
    note: 'Referral commission credited',
  });

  sendSuccess(res, 200, referral, { message: 'Referral approved and commission credited' });
});
