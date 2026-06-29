import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken, type UserRole } from '../utils/token.js';
import { User } from '../models/User.js';

export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken as string;
  }
  return null;
}

export async function protect(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('_id role isActive');
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User no longer exists or is inactive');
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export function restrictTo(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

/** Attaches user if a valid token is present, but never blocks the request. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('_id role isActive');
    if (user && user.isActive) {
      req.user = { id: user.id, role: user.role };
    }
  } catch {
    /* ignore invalid token for optional auth */
  }
  next();
}
