import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '../utils/token.js';

export type VerificationStatus = 'unverified' | 'pending' | 'ai_verified' | 'verified' | 'rejected';

export interface AmbassadorProfile {
  branch?: string;
  year?: number;
  cgpa?: number;
  languages: string[];
  linkedin?: string;
  about?: string;
  experience?: string;
  questionsAnswered: number;
  followers: number;
  rating: number;
  ratingCount: number;
  referralCode?: string;
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  googleId?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  college?: mongoose.Types.ObjectId;
  verificationStatus: VerificationStatus;
  ambassador?: AmbassadorProfile;
  savedColleges: mongoose.Types.ObjectId[];
  points: number;
  badges: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const ambassadorSchema = new Schema<AmbassadorProfile>(
  {
    branch: String,
    year: Number,
    cgpa: Number,
    languages: { type: [String], default: [] },
    linkedin: String,
    about: String,
    experience: String,
    questionsAnswered: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    referralCode: { type: String, index: true, sparse: true, unique: true },
  },
  { _id: false },
);

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false, minlength: 8 },
    role: {
      type: String,
      enum: ['student', 'ambassador', 'admin'],
      default: 'student',
      index: true,
    },
    avatarUrl: String,
    phone: String,
    googleId: { type: String, index: true, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    college: { type: Schema.Types.ObjectId, ref: 'College' },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'ai_verified', 'verified', 'rejected'],
      default: 'unverified',
    },
    ambassador: ambassadorSchema,
    savedColleges: [{ type: Schema.Types.ObjectId, ref: 'College' }],
    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).password;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.method('comparePassword', async function comparePassword(candidate: string) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
});

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
