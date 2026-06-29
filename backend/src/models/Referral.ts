import mongoose, { Schema, type Model } from 'mongoose';

export type ReferralStatus = 'clicked' | 'applied' | 'admitted' | 'rejected';

export interface IReferral {
  ambassador: mongoose.Types.ObjectId;
  student?: mongoose.Types.ObjectId;
  college?: mongoose.Types.ObjectId;
  code: string;
  status: ReferralStatus;
  clicks: number;
  commissionInr: number;
  approvedByAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type ReferralModel = Model<IReferral>;

const referralSchema = new Schema<IReferral, ReferralModel>(
  {
    ambassador: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User' },
    college: { type: Schema.Types.ObjectId, ref: 'College' },
    code: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['clicked', 'applied', 'admitted', 'rejected'],
      default: 'clicked',
      index: true,
    },
    clicks: { type: Number, default: 0 },
    commissionInr: { type: Number, default: 0 },
    approvedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Referral = mongoose.model<IReferral, ReferralModel>('Referral', referralSchema);
