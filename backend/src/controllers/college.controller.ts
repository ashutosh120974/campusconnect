import type { FilterQuery } from 'mongoose';
import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildMeta, getPageParams } from '../utils/pagination.js';
import { College, type ICollege } from '../models/College.js';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';

export const listColleges = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPageParams(req);
  const filter: FilterQuery<ICollege> = {};

  if (req.query.search) filter.$text = { $search: String(req.query.search) };
  if (req.query.state) filter.state = String(req.query.state);
  if (req.query.city) filter.city = String(req.query.city);
  if (req.query.type) filter.type = String(req.query.type);
  if (req.query.course) filter.courses = String(req.query.course);
  if (req.query.maxFees) filter.annualFeesInr = { $lte: Number(req.query.maxFees) };
  if (req.query.featured === 'true') filter.isFeatured = true;

  const sort: Record<string, 1 | -1> =
    req.query.sort === 'ranking'
      ? { nirfRanking: 1 }
      : req.query.sort === 'rating'
        ? { ratingAverage: -1 }
        : { isFeatured: -1, ratingAverage: -1 };

  const [items, total] = await Promise.all([
    College.find(filter).sort(sort).skip(skip).limit(limit),
    College.countDocuments(filter),
  ]);

  sendSuccess(res, 200, items, { meta: buildMeta(total, page, limit) });
});

export const getCollege = catchAsync(async (req: Request, res: Response) => {
  const college = await College.findOne({ slug: req.params.slug }).populate(
    'scholarships',
    'title slug type amountInr deadline',
  );
  if (!college) throw ApiError.notFound('College not found');

  const [reviews, ambassadors] = await Promise.all([
    Review.find({ college: college._id, isApproved: true })
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(10),
    User.find({ college: college._id, role: 'ambassador', verificationStatus: 'verified' })
      .select('name avatarUrl ambassador verificationStatus')
      .limit(12),
  ]);

  sendSuccess(res, 200, { college, reviews, ambassadors });
});

export const compareColleges = catchAsync(async (req: Request, res: Response) => {
  const slugs = String(req.query.slugs ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (slugs.length < 2) throw ApiError.badRequest('Provide at least two college slugs to compare');

  const colleges = await College.find({ slug: { $in: slugs } });
  sendSuccess(res, 200, colleges);
});

export const createCollege = catchAsync(async (req: Request, res: Response) => {
  const college = await College.create(req.body);
  sendSuccess(res, 201, college, { message: 'College created' });
});

export const updateCollege = catchAsync(async (req: Request, res: Response) => {
  const college = await College.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!college) throw ApiError.notFound('College not found');
  sendSuccess(res, 200, college, { message: 'College updated' });
});

export const deleteCollege = catchAsync(async (req: Request, res: Response) => {
  const college = await College.findByIdAndDelete(req.params.id);
  if (!college) throw ApiError.notFound('College not found');
  sendSuccess(res, 200, null, { message: 'College deleted' });
});
