import type { CookieOptions, Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import {
  loginUser,
  registerUser,
  rotateTokens,
  type AuthTokens,
} from '../services/auth.service.js';
import { issueOtp, verifyOtp } from '../services/otp.service.js';
import { verifyRefreshToken } from '../utils/token.js';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(res: Response, tokens: AuthTokens): void {
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const { user, tokens } = await registerUser(req.body);
  await issueOtp(user.email, 'email_verification');
  setRefreshCookie(res, tokens);
  sendSuccess(res, 201, { user, accessToken: tokens.accessToken }, {
    message: 'Account created. Verify your email with the OTP we sent.',
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, tokens } = await loginUser(req.body);
  setRefreshCookie(res, tokens);
  sendSuccess(res, 200, { user, accessToken: tokens.accessToken }, { message: 'Logged in' });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw ApiError.unauthorized('Refresh token missing');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const tokens = await rotateTokens(payload.sub, payload.role);
  setRefreshCookie(res, tokens);
  sendSuccess(res, 200, { accessToken: tokens.accessToken });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: undefined });
  sendSuccess(res, 200, null, { message: 'Logged out' });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).populate('college', 'name slug logoUrl');
  if (!user) throw ApiError.notFound('User not found');
  sendSuccess(res, 200, { user });
});

export const requestOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, purpose } = req.body;
  const result = await issueOtp(email, purpose);
  sendSuccess(res, 200, result, { message: 'OTP sent' });
});

export const confirmOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, purpose, code } = req.body;
  await verifyOtp(email, purpose, code);
  if (purpose === 'email_verification') {
    await User.updateOne({ email: email.toLowerCase() }, { isEmailVerified: true });
  }
  sendSuccess(res, 200, null, { message: 'OTP verified' });
});
