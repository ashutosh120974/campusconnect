import mongoose, { Schema, type Model } from 'mongoose';

export type NotificationType =
  | 'referral'
  | 'scholarship_deadline'
  | 'admission_alert'
  | 'chat'
  | 'verification'
  | 'system';

export interface INotification {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type NotificationModel = Model<INotification>;

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['referral', 'scholarship_deadline', 'admission_alert', 'chat', 'verification', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    body: String,
    link: String,
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Notification = mongoose.model<INotification, NotificationModel>(
  'Notification',
  notificationSchema,
);
