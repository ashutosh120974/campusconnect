import { User, type UserDocument } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import {
  signAccessToken,
  signRefreshToken,
  type UserRole,
} from '../utils/token.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function issueTokens(userId: string, role: UserRole): AuthTokens {
  return {
    accessToken: signAccessToken({ sub: userId, role }),
    refreshToken: signRefreshToken({ sub: userId, role }),
  };
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ user: UserDocument; tokens: AuthTokens }> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    password: input.password,
    role: input.role ?? 'student',
  });

  const tokens = issueTokens(user.id, user.role);
  return { user, tokens };
}

export async function loginUser(
  input: LoginInput,
): Promise<{ user: UserDocument; tokens: AuthTokens }> {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(input.password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = issueTokens(user.id, user.role);
  user.password = undefined;
  return { user, tokens };
}

export async function rotateTokens(userId: string, _role: UserRole): Promise<AuthTokens> {
  const user = await User.findById(userId).select('_id role isActive');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User no longer exists or is inactive');
  }
  return issueTokens(user.id, user.role);
}
