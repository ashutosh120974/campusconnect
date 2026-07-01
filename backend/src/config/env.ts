import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: optionalNumber('PORT', 5000),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/campusconnect'),
  clientUrl: required('CLIENT_URL', 'http://localhost:3000'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret_change_me'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  rateLimit: {
    windowMs: optionalNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: optionalNumber('RATE_LIMIT_MAX', 300),
  },
  otp: {
    ttlMinutes: optionalNumber('OTP_TTL_MINUTES', 10),
  },
  apiUrl: required('API_URL', 'http://localhost:5000/api/v1'),
  storage: {
    // 'local' persists uploads to disk; 's3' is documented in the README as a
    // drop-in driver once AWS credentials are configured.
    driver: process.env.STORAGE_DRIVER ?? 'local',
    uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
    maxFileBytes: optionalNumber('UPLOAD_MAX_BYTES', 5 * 1024 * 1024),
  },
  ocr: {
    enabled: (process.env.OCR_ENABLED ?? 'true') !== 'false',
    binary: process.env.TESSERACT_BIN ?? 'tesseract',
    minConfidence: optionalNumber('OCR_MIN_CONFIDENCE', 0.6),
    timeoutMs: optionalNumber('OCR_TIMEOUT_MS', 30_000),
  },
  // College email domains accepted for ambassador verification.
  collegeEmailDomains: (process.env.COLLEGE_EMAIL_DOMAINS ?? '.ac.in,.edu.in,.edu,.ac.uk')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),
} as const;

export type Env = typeof env;
