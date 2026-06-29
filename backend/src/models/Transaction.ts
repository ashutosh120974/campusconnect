import mongoose, { Schema, type Model } from 'mongoose';

export type TransactionType = 'commission' | 'withdrawal' | 'session_booking' | 'membership';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface ITransaction {
  user: mongoose.Types.ObjectId;
  type: TransactionType;
  status: TransactionStatus;
  amountInr: number;
  gateway?: 'razorpay' | 'stripe' | 'upi' | 'manual';
  gatewayRef?: string;
  referral?: mongoose.Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

type TransactionModel = Model<ITransaction>;

const transactionSchema = new Schema<ITransaction, TransactionModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['commission', 'withdrawal', 'session_booking', 'membership'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    amountInr: { type: Number, required: true },
    gateway: { type: String, enum: ['razorpay', 'stripe', 'upi', 'manual'] },
    gatewayRef: String,
    referral: { type: Schema.Types.ObjectId, ref: 'Referral' },
    note: String,
  },
  { timestamps: true },
);

export const Transaction = mongoose.model<ITransaction, TransactionModel>(
  'Transaction',
  transactionSchema,
);
