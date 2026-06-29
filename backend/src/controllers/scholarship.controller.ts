import type { FilterQuery } from 'mongoose';
import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildMeta, getPageParams } from '../utils/pagination.js';
import { Scholarship, type IScholarship } from '../models/Scholarship.js';

export const listScholarships = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPageParams(req);
  const filter: FilterQuery<IScholarship> = { isActive: true };

  if (req.query.search) filter.$text = { $search: String(req.query.search) };
  if (req.query.type) filter.type = String(req.query.type);
  if (req.query.state) filter.state = String(req.query.state);
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.gender) filter.gender = { $in: [String(req.query.gender), 'any'] };
  if (req.query.merit === 'true') filter.meritBased = true;
  if (req.query.maxIncome) filter.maxIncomeInr = { $gte: Number(req.query.maxIncome) };

  const [items, total] = await Promise.all([
    Scholarship.find(filter).sort({ deadline: 1 }).skip(skip).limit(limit),
    Scholarship.countDocuments(filter),
  ]);

  sendSuccess(res, 200, items, { meta: buildMeta(total, page, limit) });
});

export const getScholarship = catchAsync(async (req: Request, res: Response) => {
  const scholarship = await Scholarship.findOne({ slug: req.params.slug }).populate(
    'college',
    'name slug',
  );
  if (!scholarship) throw ApiError.notFound('Scholarship not found');
  sendSuccess(res, 200, scholarship);
});

export const createScholarship = catchAsync(async (req: Request, res: Response) => {
  const scholarship = await Scholarship.create(req.body);
  sendSuccess(res, 201, scholarship, { message: 'Scholarship created' });
});

export const updateScholarship = catchAsync(async (req: Request, res: Response) => {
  const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!scholarship) throw ApiError.notFound('Scholarship not found');
  sendSuccess(res, 200, scholarship, { message: 'Scholarship updated' });
});

export const deleteScholarship = catchAsync(async (req: Request, res: Response) => {
  const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
  if (!scholarship) throw ApiError.notFound('Scholarship not found');
  sendSuccess(res, 200, null, { message: 'Scholarship deleted' });
});
