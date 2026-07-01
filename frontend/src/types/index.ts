export type UserRole = "student" | "ambassador" | "admin";
export type VerificationStatus =
  | "unverified"
  | "pending"
  | "ai_verified"
  | "verified"
  | "rejected";

export interface AmbassadorProfile {
  branch?: string;
  year?: number;
  cgpa?: number;
  languages: string[];
  linkedin?: string;
  about?: string;
  experience?: string;
  questionsAnswered: number;
  followers: number;
  rating: number;
  ratingCount: number;
  referralCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  isEmailVerified: boolean;
  college?: College | string;
  ambassador?: AmbassadorProfile;
  points: number;
  badges: string[];
}

export interface PlacementStats {
  averagePackageLpa?: number;
  highestPackageLpa?: number;
  placementRate?: number;
  topRecruiters: string[];
}

export interface College {
  _id: string;
  name: string;
  slug: string;
  shortName?: string;
  logoUrl?: string;
  bannerUrl?: string;
  gallery: string[];
  about?: string;
  city?: string;
  state?: string;
  type?: string;
  nirfRanking?: number;
  accreditation: string[];
  annualFeesInr?: number;
  hostelFeesInr?: number;
  courses: string[];
  facilities: string[];
  faculty: string[];
  placement: PlacementStats;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  scholarships?: Scholarship[];
}

export interface Scholarship {
  _id: string;
  title: string;
  slug: string;
  provider?: string;
  type: "government" | "state" | "private" | "college";
  description?: string;
  amountInr?: number;
  category: string[];
  state?: string;
  maxIncomeInr?: number;
  meritBased: boolean;
  deadline?: string;
  applyUrl?: string;
}

export interface Review {
  _id: string;
  author: { name: string; avatarUrl?: string };
  ratings: Record<string, number>;
  overall: number;
  title?: string;
  body?: string;
  createdAt: string;
}

export interface Ambassador extends User {
  ambassador: AmbassadorProfile;
}

export interface CommunityPost {
  _id: string;
  author: { _id: string; name: string; avatarUrl?: string; verificationStatus?: string };
  title: string;
  body: string;
  category: string;
  tags: string[];
  likes: string[];
  commentCount: number;
  createdAt: string;
}

export type VerificationStep =
  | "email"
  | "id_upload"
  | "ocr"
  | "admin_review"
  | "complete";
export type VerificationDecision =
  | "pending"
  | "ai_verified"
  | "approved"
  | "rejected"
  | "reupload";

export interface OcrResult {
  studentName?: string;
  collegeName?: string;
  enrollmentNumber?: string;
  course?: string;
  branch?: string;
  year?: string;
  studentIdNumber?: string;
  expiryDate?: string;
  matched?: boolean;
  confidence?: number;
}

export interface StudentVerification {
  _id: string;
  user: string | { _id: string; name: string; email: string; role: string; verificationStatus: string };
  collegeEmail?: string;
  collegeEmailVerified: boolean;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
  ocr?: OcrResult;
  step: VerificationStep;
  decision: VerificationDecision;
  fraudFlags: string[];
  adminNote?: string;
  reviewedAt?: string;
  updatedAt: string;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  ambassadors: number;
  colleges: number;
  pendingReviews: number;
  aiVerified: number;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PageMeta;
}
