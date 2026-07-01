import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export interface StoredFile {
  /** Stable key persisted on the verification document. */
  key: string;
  /** Absolute path on disk (local driver only). */
  absolutePath: string;
}

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

function assertLocalDriver(): void {
  if (env.storage.driver !== 'local') {
    // The S3 driver is documented in the README; only the local driver ships today.
    throw ApiError.internal(`Storage driver "${env.storage.driver}" is not implemented`);
  }
}

function resolveUploadRoot(): string {
  return path.resolve(process.cwd(), env.storage.uploadDir);
}

/** Persists an uploaded buffer under a per-user, per-kind key and returns its key. */
export async function saveVerificationFile(
  userId: string,
  kind: 'front' | 'back' | 'selfie',
  file: { buffer: Buffer; mimetype: string },
): Promise<StoredFile> {
  assertLocalDriver();

  const ext = EXT_BY_MIME[file.mimetype];
  if (!ext) {
    throw ApiError.badRequest('Unsupported file type. Upload a PNG, JPG, or WEBP image.');
  }

  const filename = `${kind}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const key = path.posix.join('verification', userId, filename);
  const absolutePath = path.join(resolveUploadRoot(), key);

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, file.buffer);

  return { key, absolutePath };
}

/** Resolves a stored key back to a readable absolute path, guarding against traversal. */
export function resolveKeyToPath(key: string): string {
  assertLocalDriver();
  const root = resolveUploadRoot();
  const absolutePath = path.resolve(root, key);
  if (!absolutePath.startsWith(root + path.sep)) {
    throw ApiError.badRequest('Invalid file key');
  }
  return absolutePath;
}

/** Builds the client-facing URL used to stream a stored file through the API. */
export function toFileUrl(key: string): string {
  return `${env.apiUrl}/verification/files?key=${encodeURIComponent(key)}`;
}

export async function deleteFile(key: string): Promise<void> {
  assertLocalDriver();
  try {
    await fs.unlink(resolveKeyToPath(key));
  } catch {
    /* best-effort cleanup */
  }
}
