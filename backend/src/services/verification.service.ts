import crypto from 'node:crypto';
import { StudentVerification, type IStudentVerification } from '../models/StudentVerification.js';
import { User } from '../models/User.js';
import { Referral } from '../models/Referral.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { issueOtp, verifyOtp } from './otp.service.js';
import { extractIdCard, matchOcrWithProfile } from './ocr.service.js';
import { saveVerificationFile, deleteFile, resolveKeyToPath } from './storage.service.js';
import type { HydratedDocument } from 'mongoose';

type VerificationDoc = HydratedDocument<IStudentVerification>;

function isCollegeEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return env.collegeEmailDomains.some((domain) => lower.endsWith(domain));
}

async function getOrCreate(userId: string): Promise<VerificationDoc> {
  const existing = await StudentVerification.findOne({ user: userId });
  if (existing) return existing;
  return StudentVerification.create({ user: userId });
}

export async function getMyVerification(userId: string): Promise<VerificationDoc> {
  return getOrCreate(userId);
}

/** Step 1a: validate the college email domain and send an OTP to it. */
export async function startEmailVerification(
  userId: string,
  collegeEmail: string,
): Promise<{ devCode?: string }> {
  if (!isCollegeEmail(collegeEmail)) {
    throw ApiError.badRequest(
      `"${collegeEmail}" is not a recognised college email. Allowed domains: ${env.collegeEmailDomains.join(', ')}`,
    );
  }

  const duplicate = await StudentVerification.findOne({
    collegeEmail: collegeEmail.toLowerCase(),
    collegeEmailVerified: true,
    user: { $ne: userId },
  });
  if (duplicate) {
    throw ApiError.conflict('This college email is already linked to another verified account.');
  }

  const verification = await getOrCreate(userId);
  verification.collegeEmail = collegeEmail.toLowerCase();
  verification.collegeEmailVerified = false;
  await verification.save();

  return issueOtp(collegeEmail, 'college_email');
}

/** Step 1b: confirm the OTP and advance to the ID-upload step. */
export async function confirmEmailVerification(
  userId: string,
  collegeEmail: string,
  code: string,
): Promise<VerificationDoc> {
  if (!isCollegeEmail(collegeEmail)) {
    throw ApiError.badRequest('Invalid college email.');
  }
  await verifyOtp(collegeEmail, 'college_email', code);

  const verification = await getOrCreate(userId);
  verification.collegeEmail = collegeEmail.toLowerCase();
  verification.collegeEmailVerified = true;
  if (verification.step === 'email') verification.step = 'id_upload';
  await verification.save();

  await User.updateOne(
    { _id: userId, verificationStatus: 'unverified' },
    { verificationStatus: 'pending' },
  );
  return verification;
}

interface IdUploads {
  front: { buffer: Buffer; mimetype: string };
  back?: { buffer: Buffer; mimetype: string };
  selfie?: { buffer: Buffer; mimetype: string };
}

/**
 * Step 2 + 3: store the uploaded ID images, run OCR, match against the profile,
 * evaluate fraud signals, and set the resulting decision.
 */
export async function submitIdDocuments(
  userId: string,
  uploads: IdUploads,
): Promise<VerificationDoc> {
  const verification = await getOrCreate(userId);
  if (!verification.collegeEmailVerified) {
    throw ApiError.badRequest('Verify your college email before uploading your ID.');
  }

  const user = await User.findById(userId).populate<{ college?: { name: string } }>(
    'college',
    'name',
  );
  if (!user) throw ApiError.notFound('User not found');

  // Replace any previously stored files.
  for (const key of [verification.idFrontUrl, verification.idBackUrl, verification.selfieUrl]) {
    if (key) await deleteFile(key);
  }

  const front = await saveVerificationFile(userId, 'front', uploads.front);
  verification.idFrontUrl = front.key;
  if (uploads.back) verification.idBackUrl = (await saveVerificationFile(userId, 'back', uploads.back)).key;
  if (uploads.selfie)
    verification.selfieUrl = (await saveVerificationFile(userId, 'selfie', uploads.selfie)).key;

  verification.step = 'ocr';

  const ocr = await extractIdCard(front.absolutePath);
  const profileCollegeName = user.college?.name;
  const match = matchOcrWithProfile(ocr, {
    profileName: user.name,
    profileCollegeName,
  });

  const fraudFlags = await detectFraud(userId, ocr, match.mismatches);

  verification.ocr = { ...ocr, matched: match.matched, confidence: match.confidence };
  verification.fraudFlags = fraudFlags;

  if (match.matched && fraudFlags.length === 0) {
    verification.decision = 'ai_verified';
    verification.step = 'admin_review';
    await User.updateOne({ _id: userId }, { verificationStatus: 'ai_verified' });
  } else {
    verification.decision = 'pending';
    verification.step = 'admin_review';
    await User.updateOne({ _id: userId }, { verificationStatus: 'pending' });
  }

  await verification.save();
  return verification;
}

/** Evaluates fraud signals across the verification corpus. */
async function detectFraud(
  userId: string,
  ocr: { enrollmentNumber?: string; studentIdNumber?: string; expiryDate?: string },
  mismatches: string[],
): Promise<string[]> {
  const flags = new Set<string>(mismatches);

  if (ocr.enrollmentNumber) {
    const dup = await StudentVerification.findOne({
      'ocr.enrollmentNumber': ocr.enrollmentNumber,
      user: { $ne: userId },
    });
    if (dup) flags.add('duplicate_enrollment');
  }

  if (ocr.studentIdNumber) {
    const dup = await StudentVerification.findOne({
      'ocr.studentIdNumber': ocr.studentIdNumber,
      user: { $ne: userId },
    });
    if (dup) flags.add('duplicate_id_number');
  }

  if (ocr.expiryDate) {
    const parsed = Date.parse(ocr.expiryDate);
    if (!Number.isNaN(parsed) && parsed < Date.now()) flags.add('expired_id');
  }

  if (!ocr.enrollmentNumber && !ocr.studentIdNumber) {
    flags.add('ocr_low_extraction');
  }

  return [...flags];
}

async function generateReferralCode(name: string): Promise<string> {
  const base = name.replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase() || 'AMB';
  for (let i = 0; i < 10; i += 1) {
    const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code = `${base}${suffix}`;
    const exists = await User.exists({ 'ambassador.referralCode': code });
    if (!exists) return code;
  }
  return `${base}${Date.now().toString(36).toUpperCase()}`;
}

export type ReviewAction = 'approve' | 'reject' | 'reupload';

/** Step 4: an admin approves, rejects, or requests re-upload of a verification. */
export async function reviewVerification(
  adminId: string,
  verificationId: string,
  action: ReviewAction,
  note?: string,
): Promise<VerificationDoc> {
  const verification = await StudentVerification.findById(verificationId);
  if (!verification) throw ApiError.notFound('Verification not found');

  const user = await User.findById(verification.user);
  if (!user) throw ApiError.notFound('User not found');

  verification.reviewedBy = adminId as unknown as VerificationDoc['reviewedBy'];
  verification.reviewedAt = new Date();
  if (note) verification.adminNote = note;

  if (action === 'approve') {
    verification.decision = 'approved';
    verification.step = 'complete';
    user.verificationStatus = 'verified';
    user.role = 'ambassador';
    user.ambassador = {
      ...(user.ambassador ?? {}),
      languages: user.ambassador?.languages ?? [],
      questionsAnswered: user.ambassador?.questionsAnswered ?? 0,
      followers: user.ambassador?.followers ?? 0,
      rating: user.ambassador?.rating ?? 0,
      ratingCount: user.ambassador?.ratingCount ?? 0,
      referralCode: user.ambassador?.referralCode ?? (await generateReferralCode(user.name)),
    };
    await user.save();
    await Referral.updateOne(
      { ambassador: user._id, code: user.ambassador.referralCode },
      {
        $setOnInsert: {
          ambassador: user._id,
          code: user.ambassador.referralCode,
          status: 'clicked',
        },
      },
      { upsert: true },
    );
  } else if (action === 'reject') {
    verification.decision = 'rejected';
    verification.step = 'admin_review';
    user.verificationStatus = 'rejected';
    await user.save();
  } else {
    verification.decision = 'reupload';
    verification.step = 'id_upload';
    user.verificationStatus = 'pending';
    await user.save();
  }

  await verification.save();
  return verification;
}

export interface VerificationListFilters {
  decision?: string;
  step?: string;
}

export async function listVerifications(filters: VerificationListFilters) {
  const query: Record<string, unknown> = {};
  if (filters.decision) query.decision = filters.decision;
  if (filters.step) query.step = filters.step;
  return StudentVerification.find(query)
    .sort({ updatedAt: -1 })
    .populate('user', 'name email role verificationStatus college')
    .lean();
}

/** Resolves a stored file key to a disk path if the requester may access it. */
export async function authorizeFileAccess(
  key: string,
  requester: { id: string; role: string },
): Promise<string> {
  const verification = await StudentVerification.findOne({
    $or: [{ idFrontUrl: key }, { idBackUrl: key }, { selfieUrl: key }],
  }).select('user');
  if (!verification) throw ApiError.notFound('File not found');

  const isOwner = verification.user.toString() === requester.id;
  if (!isOwner && requester.role !== 'admin') {
    throw ApiError.forbidden('You do not have access to this file');
  }
  return resolveKeyToPath(key);
}
