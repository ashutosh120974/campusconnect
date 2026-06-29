import mongoose, { type FilterQuery } from 'mongoose';
import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildMeta, getPageParams } from '../utils/pagination.js';
import { CommunityPost, type ICommunityPost } from '../models/CommunityPost.js';

export const listPosts = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPageParams(req);
  const filter: FilterQuery<ICommunityPost> = {};
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.tag) filter.tags = String(req.query.tag);
  if (req.query.search) filter.$text = { $search: String(req.query.search) };

  const [items, total] = await Promise.all([
    CommunityPost.find(filter)
      .populate('author', 'name avatarUrl role verificationStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CommunityPost.countDocuments(filter),
  ]);

  sendSuccess(res, 200, items, { meta: buildMeta(total, page, limit) });
});

export const getPost = catchAsync(async (req: Request, res: Response) => {
  const post = await CommunityPost.findById(req.params.id).populate(
    'author',
    'name avatarUrl role verificationStatus',
  );
  if (!post) throw ApiError.notFound('Post not found');
  sendSuccess(res, 200, post);
});

export const createPost = catchAsync(async (req: Request, res: Response) => {
  const post = await CommunityPost.create({ ...req.body, author: req.user!.id });
  sendSuccess(res, 201, post, { message: 'Post created' });
});

export const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post) throw ApiError.notFound('Post not found');

  const userId = req.user!.id;
  const index = post.likes.findIndex((id) => id.toString() === userId);
  if (index >= 0) post.likes.splice(index, 1);
  else post.likes.push(new mongoose.Types.ObjectId(userId));
  await post.save();

  sendSuccess(res, 200, { liked: index < 0, likeCount: post.likes.length });
});
