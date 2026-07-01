import { execFile } from 'node:child_process';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { OcrResult } from '../models/StudentVerification.js';

/** Runs the Tesseract CLI on an image and returns the raw recognized text. */
function runTesseract(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      env.ocr.binary,
      [imagePath, 'stdout'],
      { timeout: env.ocr.timeoutMs, maxBuffer: 5 * 1024 * 1024 },
      (error, stdout) => {
        if (error) return reject(error);
        resolve(stdout ?? '');
      },
    );
  });
}

function firstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
}

/** Extracts structured ID-card fields from raw OCR text using label heuristics. */
export function parseIdCardText(text: string): OcrResult {
  const clean = text.replace(/[|]/g, ' ').replace(/[ \t]+/g, ' ');
  return {
    studentName: firstMatch(clean, [/name[:\s]+([A-Za-z .'-]{3,60})/i]),
    collegeName: firstMatch(clean, [
      /college[:\s]+([A-Za-z0-9 .,'&()-]{3,80})/i,
      /institute[:\s]+([A-Za-z0-9 .,'&()-]{3,80})/i,
      /university[:\s]+([A-Za-z0-9 .,'&()-]{3,80})/i,
    ]),
    enrollmentNumber: firstMatch(clean, [
      /enroll(?:ment)?\s*(?:no|number|id)?[:\s]+([A-Za-z0-9/-]{4,30})/i,
      /roll\s*(?:no|number)?[:\s]+([A-Za-z0-9/-]{4,30})/i,
    ]),
    course: firstMatch(clean, [/course[:\s]+([A-Za-z0-9 .()-]{2,40})/i, /(?:degree|program)[:\s]+([A-Za-z0-9 .()-]{2,40})/i]),
    branch: firstMatch(clean, [/branch[:\s]+([A-Za-z0-9 &().-]{2,50})/i, /department[:\s]+([A-Za-z0-9 &().-]{2,50})/i]),
    year: firstMatch(clean, [/year[:\s]+([0-9]{1,4}(?:st|nd|rd|th)?)/i]),
    studentIdNumber: firstMatch(clean, [/(?:student\s*id|id\s*(?:no|number)|card\s*no)[:\s]+([A-Za-z0-9/-]{3,30})/i]),
    expiryDate: firstMatch(clean, [
      /(?:valid\s*(?:till|until|upto)|expiry|expires?)[:\s]+([0-9]{2,4}[-/][0-9]{1,2}[-/][0-9]{1,4})/i,
    ]),
  };
}

function normalize(value?: string): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Token-overlap similarity in [0,1] between two free-text strings. */
function similarity(a?: string, b?: string): number {
  const an = normalize(a);
  const bn = normalize(b);
  if (!an || !bn) return 0;
  if (an === bn) return 1;
  if (an.includes(bn) || bn.includes(an)) return 0.9;

  const aTokens = new Set((a ?? '').toLowerCase().split(/\s+/).filter((t) => t.length > 1));
  const bTokens = new Set((b ?? '').toLowerCase().split(/\s+/).filter((t) => t.length > 1));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let shared = 0;
  for (const token of aTokens) if (bTokens.has(token)) shared += 1;
  return shared / Math.max(aTokens.size, bTokens.size);
}

export interface MatchInput {
  profileName: string;
  profileCollegeName?: string;
}

export interface MatchOutcome {
  matched: boolean;
  confidence: number;
  mismatches: string[];
}

/** Compares OCR-extracted fields against the user's profile. */
export function matchOcrWithProfile(ocr: OcrResult, input: MatchInput): MatchOutcome {
  const nameScore = similarity(ocr.studentName, input.profileName);
  const collegeScore = input.profileCollegeName
    ? similarity(ocr.collegeName, input.profileCollegeName)
    : ocr.collegeName
      ? 0.6
      : 0;

  const mismatches: string[] = [];
  if (nameScore < 0.5) mismatches.push('name_mismatch');
  if (input.profileCollegeName && collegeScore < 0.5) mismatches.push('college_mismatch');

  // Weight the name more heavily than the college string.
  const confidence = Number((nameScore * 0.6 + collegeScore * 0.4).toFixed(2));
  const matched = confidence >= env.ocr.minConfidence && mismatches.length === 0;
  return { matched, confidence, mismatches };
}

/** Full OCR pipeline: recognize text, parse fields, and return a partial result. */
export async function extractIdCard(imagePath: string): Promise<OcrResult> {
  if (!env.ocr.enabled) {
    logger.warn('OCR disabled via config; skipping extraction');
    return {};
  }
  try {
    const text = await runTesseract(imagePath);
    return parseIdCardText(text);
  } catch (error) {
    logger.error(`OCR extraction failed: ${(error as Error).message}`);
    return {};
  }
}
