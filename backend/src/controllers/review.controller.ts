import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Review } from '../models/Review.js';
import { College } from '../models/College.js';

function overallOf(r: Record<string, number>): number {
  const vals = Object.values(r);
  return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
}

async function recomputeCollegeRating(collegeId: string): Promise<void> {
  const agg = await Review.aggregate<{ _id: null; avg: number; count: number }>([
    { $match: { college: new mongoose.Types.ObjectId(collegeId), isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$overall' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] ?? {};
  await College.findByIdAndUpdate(collegeId, {
    ratingAverage: Number(avg.toFixed(2)),
    ratingCount: count,
  });
}

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { college, ratings, title, body } = req.body;
  const collegeDoc = await College.findById(college);
  if (!collegeDoc) throw ApiError.notFound('College not found');

  const overall = overallOf(ratings);
  const review = await Review.findOneAndUpdate(
    { college, author: req.user!.id },
    { college, author: req.user!.id, ratings, overall, title, body },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );

  await recomputeCollegeRating(String(college));
  sendSuccess(res, 201, review, { message: 'Review submitted' });
});

export const listCollegeReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await Review.find({ college: req.params.collegeId, isApproved: true })
    .populate('author', 'name avatarUrl')
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, reviews);
});
