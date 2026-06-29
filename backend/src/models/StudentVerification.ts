import mongoose, { Schema, type Model } from 'mongoose';

export type VerificationStep = 'email' | 'id_upload' | 'ocr' | 'admin_review' | 'complete';
export type VerificationDecision = 'pending' | 'ai_verified' | 'approved' | 'rejected' | 'reupload';

export interface OcrResult {
  studentName?: string;
  collegeName?: string;
  enrollmentNumber?: string;
  course?: string;
  branch?: string;
  year?: string;
  studentIdNumber?: string;
  expiryDate?: string;
  matched?: boolean;
  confidence?: number;
}

export interface IStudentVerification {
  user: mongoose.Types.ObjectId;
  collegeEmail?: string;
  collegeEmailVerified: boolean;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
  ocr?: OcrResult;
  step: VerificationStep;
  decision: VerificationDecision;
  fraudFlags: string[];
  adminNote?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type StudentVerificationModel = Model<IStudentVerification>;

const verificationSchema = new Schema<IStudentVerification, StudentVerificationModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    collegeEmail: { type: String, lowercase: true, trim: true },
    collegeEmailVerified: { type: Boolean, default: false },
    idFrontUrl: String,
    idBackUrl: String,
    selfieUrl: String,
    ocr: {
      studentName: String,
      collegeName: String,
      enrollmentNumber: String,
      course: String,
      branch: String,
      year: String,
      studentIdNumber: String,
      expiryDate: String,
      matched: Boolean,
      confidence: Number,
    },
    step: {
      type: String,
      enum: ['email', 'id_upload', 'ocr', 'admin_review', 'complete'],
      default: 'email',
    },
    decision: {
      type: String,
      enum: ['pending', 'ai_verified', 'approved', 'rejected', 'reupload'],
      default: 'pending',
      index: true,
    },
    fraudFlags: { type: [String], default: [] },
    adminNote: String,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true },
);

export const StudentVerification = mongoose.model<IStudentVerification, StudentVerificationModel>(
  'StudentVerification',
  verificationSchema,
);
