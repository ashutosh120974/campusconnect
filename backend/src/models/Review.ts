import mongoose, { Schema, type Model } from 'mongoose';

export interface IReview {
  college: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  ratings: {
    academics: number;
    faculty: number;
    hostel: number;
    placement: number;
    campusLife: number;
    infrastructure: number;
  };
  overall: number;
  title?: string;
  body?: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ReviewModel = Model<IReview>;

const ratingField = { type: Number, min: 1, max: 5, required: true };

const reviewSchema = new Schema<IReview, ReviewModel>(
  {
    college: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: {
      academics: ratingField,
      faculty: ratingField,
      hostel: ratingField,
      placement: ratingField,
      campusLife: ratingField,
      infrastructure: ratingField,
    },
    overall: { type: Number, min: 1, max: 5, required: true },
    title: String,
    body: { type: String, maxlength: 4000 },
    isApproved: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

reviewSchema.index({ college: 1, author: 1 }, { unique: true });

export const Review = mongoose.model<IReview, ReviewModel>('Review', reviewSchema);
