import type { FilterQuery } from 'mongoose';
import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildMeta, getPageParams } from '../utils/pagination.js';
import { User, type IUser } from '../models/User.js';

export const listAmbassadors = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPageParams(req);
  const filter: FilterQuery<IUser> = {
    role: 'ambassador',
    verificationStatus: 'verified',
    isActive: true,
  };
  if (req.query.college) filter.college = String(req.query.college);
  if (req.query.search) filter.name = { $regex: String(req.query.search), $options: 'i' };

  const sort: Record<string, 1 | -1> =
    req.query.sort === 'rating' ? { 'ambassador.rating': -1 } : { 'ambassador.followers': -1 };

  const [items, total] = await Promise.all([
    User.find(filter)
      .select('name avatarUrl ambassador verificationStatus college')
      .populate('college', 'name slug logoUrl')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, 200, items, { meta: buildMeta(total, page, limit) });
});

export const getAmbassador = catchAsync(async (req: Request, res: Response) => {
  const ambassador = await User.findOne({
    _id: req.params.id,
    role: 'ambassador',
  })
    .select('name avatarUrl ambassador verificationStatus college createdAt')
    .populate('college', 'name slug logoUrl city state');
  if (!ambassador) throw ApiError.notFound('Ambassador not found');
  sendSuccess(res, 200, ambassador);
});

export const getTopAmbassadors = catchAsync(async (_req: Request, res: Response) => {
  const ambassadors = await User.find({
    role: 'ambassador',
    verificationStatus: 'verified',
    isActive: true,
  })
    .select('name avatarUrl ambassador college')
    .populate('college', 'name slug logoUrl')
    .sort({ 'ambassador.rating': -1, 'ambassador.followers': -1 })
    .limit(8);
  sendSuccess(res, 200, ambassadors);
});
