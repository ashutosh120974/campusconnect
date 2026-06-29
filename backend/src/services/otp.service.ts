import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Otp, type OtpPurpose } from '../models/Otp.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

function generateCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * Creates an OTP, persists a hashed copy, and "sends" it.
 * In development the code is logged; wire a real email/SMS provider in production.
 */
export async function issueOtp(email: string, purpose: OtpPurpose): Promise<{ devCode?: string }> {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.otp.ttlMinutes * 60 * 1000);

  await Otp.deleteMany({ email: email.toLowerCase(), purpose, consumed: false });
  await Otp.create({ email: email.toLowerCase(), codeHash, purpose, expiresAt });

  if (env.isProd) {
    // TODO: integrate transactional email/SMS provider (SES, SendGrid, Twilio).
    logger.info(`OTP issued for ${email} (${purpose})`);
    return {};
  }

  logger.info(`[DEV] OTP for ${email} (${purpose}): ${code}`);
  return { devCode: code };
}

export async function verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<void> {
  const otp = await Otp.findOne({
    email: email.toLowerCase(),
    purpose,
    consumed: false,
  }).sort({ createdAt: -1 });

  if (!otp) {
    throw ApiError.badRequest('No active OTP found. Please request a new code.');
  }
  if (otp.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('OTP has expired. Please request a new code.');
  }
  if (otp.attempts >= 5) {
    throw ApiError.badRequest('Too many invalid attempts. Please request a new code.');
  }

  const matches = await bcrypt.compare(code, otp.codeHash);
  if (!matches) {
    otp.attempts += 1;
    await otp.save();
    throw ApiError.badRequest('Invalid OTP code.');
  }

  otp.consumed = true;
  await otp.save();
}
