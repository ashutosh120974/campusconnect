import mongoose, { Schema, type Model } from 'mongoose';

export type OtpPurpose = 'email_verification' | 'login' | 'college_email';

export interface IOtp {
  email: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
  consumed: boolean;
  createdAt: Date;
}

type OtpModel = Model<IOtp>;

const otpSchema = new Schema<IOtp, OtpModel>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['email_verification', 'login', 'college_email'],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// TTL index: documents auto-removed once expired.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp, OtpModel>('Otp', otpSchema);
