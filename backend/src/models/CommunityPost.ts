import mongoose, { Schema, type Model } from 'mongoose';

export const POST_CATEGORIES = [
  'admission',
  'scholarship',
  'placement',
  'hostel',
  'academics',
  'campus_life',
  'internship',
  'coding',
  'exams',
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export interface ICommunityPost {
  author: mongoose.Types.ObjectId;
  title: string;
  body: string;
  category: PostCategory;
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  commentCount: number;
  college?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type CommunityPostModel = Model<ICommunityPost>;

const postSchema = new Schema<ICommunityPost, CommunityPostModel>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 10000 },
    category: { type: String, enum: POST_CATEGORIES, required: true, index: true },
    tags: { type: [String], default: [], index: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentCount: { type: Number, default: 0 },
    college: { type: Schema.Types.ObjectId, ref: 'College' },
  },
  { timestamps: true },
);

postSchema.index({ title: 'text', body: 'text' });

export const CommunityPost = mongoose.model<ICommunityPost, CommunityPostModel>(
  'CommunityPost',
  postSchema,
);
