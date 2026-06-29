import mongoose, { Schema, type Model } from 'mongoose';

export interface PlacementStats {
  averagePackageLpa?: number;
  highestPackageLpa?: number;
  placementRate?: number;
  topRecruiters: string[];
}

export interface ICollege {
  name: string;
  slug: string;
  shortName?: string;
  logoUrl?: string;
  bannerUrl?: string;
  gallery: string[];
  about?: string;
  city?: string;
  state?: string;
  type?: 'government' | 'private' | 'deemed' | 'autonomous';
  nirfRanking?: number;
  accreditation: string[];
  annualFeesInr?: number;
  hostelFeesInr?: number;
  courses: string[];
  facilities: string[];
  faculty: string[];
  scholarships: mongoose.Types.ObjectId[];
  placement: PlacementStats;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type CollegeModel = Model<ICollege>;

const collegeSchema = new Schema<ICollege, CollegeModel>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    shortName: String,
    logoUrl: String,
    bannerUrl: String,
    gallery: { type: [String], default: [] },
    about: String,
    city: { type: String, index: true },
    state: { type: String, index: true },
    type: { type: String, enum: ['government', 'private', 'deemed', 'autonomous'] },
    nirfRanking: { type: Number, index: true },
    accreditation: { type: [String], default: [] },
    annualFeesInr: Number,
    hostelFeesInr: Number,
    courses: { type: [String], default: [] },
    facilities: { type: [String], default: [] },
    faculty: { type: [String], default: [] },
    scholarships: [{ type: Schema.Types.ObjectId, ref: 'Scholarship' }],
    placement: {
      averagePackageLpa: Number,
      highestPackageLpa: Number,
      placementRate: Number,
      topRecruiters: { type: [String], default: [] },
    },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

collegeSchema.index({ name: 'text', about: 'text', city: 'text', state: 'text' });

export const College = mongoose.model<ICollege, CollegeModel>('College', collegeSchema);
