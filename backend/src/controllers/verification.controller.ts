import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { toFileUrl } from '../services/storage.service.js';
import {
  startEmailVerification,
  confirmEmailVerification,
  submitIdDocuments,
  getMyVerification,
  authorizeFileAccess,
} from '../services/verification.service.js';
import type { IStudentVerification } from '../models/StudentVerification.js';
import type { HydratedDocument } from 'mongoose';

/** Serializes a verification, exposing stored file keys as streamable URLs. */
function serialize(v: HydratedDocument<IStudentVerification>) {
  const obj = v.toObject();
  return {
    ...obj,
    idFrontUrl: obj.idFrontUrl ? toFileUrl(obj.idFrontUrl) : undefined,
    idBackUrl: obj.idBackUrl ? toFileUrl(obj.idBackUrl) : undefined,
    selfieUrl: obj.selfieUrl ? toFileUrl(obj.selfieUrl) : undefined,
  };
}

export const myVerification = catchAsync(async (req: Request, res: Response) => {
  const verification = await getMyVerification(req.user!.id);
  sendSuccess(res, 200, { verification: serialize(verification) });
});

export const requestEmailOtp = catchAsync(async (req: Request, res: Response) => {
  const { collegeEmail } = req.body as { collegeEmail: string };
  const result = await startEmailVerification(req.user!.id, collegeEmail);
  sendSuccess(res, 200, result, { message: 'OTP sent to your college email' });
});

export const confirmEmailOtp = catchAsync(async (req: Request, res: Response) => {
  const { collegeEmail, code } = req.body as { collegeEmail: string; code: string };
  const verification = await confirmEmailVerification(req.user!.id, collegeEmail, code);
  sendSuccess(res, 200, { verification: serialize(verification) }, {
    message: 'College email verified',
  });
});

export const uploadIds = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const front = files?.front?.[0];
  if (!front) throw ApiError.badRequest('The front of your student ID is required.');

  const verification = await submitIdDocuments(req.user!.id, {
    front: { buffer: front.buffer, mimetype: front.mimetype },
    back: files?.back?.[0]
      ? { buffer: files.back[0].buffer, mimetype: files.back[0].mimetype }
      : undefined,
    selfie: files?.selfie?.[0]
      ? { buffer: files.selfie[0].buffer, mimetype: files.selfie[0].mimetype }
      : undefined,
  });

  sendSuccess(res, 200, { verification: serialize(verification) }, {
    message: 'ID submitted. OCR complete — awaiting review.',
  });
});

export const streamFile = catchAsync(async (req: Request, res: Response) => {
  const key = req.query.key as string | undefined;
  if (!key) throw ApiError.badRequest('Missing file key');
  const absolutePath = await authorizeFileAccess(key, req.user!);
  res.sendFile(absolutePath);
});
