import mongoose, { Schema, type Model } from 'mongoose';

export type ScholarshipType = 'government' | 'state' | 'private' | 'college';
export type ScholarshipCategory = 'general' | 'obc' | 'sc' | 'st' | 'ews' | 'minority';

export interface IScholarship {
  title: string;
  slug: string;
  provider?: string;
  type: ScholarshipType;
  description?: string;
  amountInr?: number;
  category: ScholarshipCategory[];
  gender?: 'any' | 'male' | 'female' | 'other';
  state?: string;
  maxIncomeInr?: number;
  meritBased: boolean;
  eligibility?: string;
  applyUrl?: string;
  deadline?: Date;
  college?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ScholarshipModel = Model<IScholarship>;

const scholarshipSchema = new Schema<IScholarship, ScholarshipModel>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    provider: String,
    type: {
      type: String,
      enum: ['government', 'state', 'private', 'college'],
      required: true,
      index: true,
    },
    description: String,
    amountInr: Number,
    category: {
      type: [String],
      enum: ['general', 'obc', 'sc', 'st', 'ews', 'minority'],
      default: ['general'],
    },
    gender: { type: String, enum: ['any', 'male', 'female', 'other'], default: 'any' },
    state: { type: String, index: true },
    maxIncomeInr: Number,
    meritBased: { type: Boolean, default: false },
    eligibility: String,
    applyUrl: String,
    deadline: { type: Date, index: true },
    college: { type: Schema.Types.ObjectId, ref: 'College' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

scholarshipSchema.index({ title: 'text', description: 'text', provider: 'text' });

export const Scholarship = mongoose.model<IScholarship, ScholarshipModel>(
  'Scholarship',
  scholarshipSchema,
);
