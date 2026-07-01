import { api, getData, postData } from "./api";
import type {
  ApiResponse,
  AdminStats,
  StudentVerification,
} from "@/types";

export async function getMyVerification(): Promise<StudentVerification> {
  const res = await getData<{ verification: StudentVerification }>("/verification/me");
  return res.data.verification;
}

export async function requestCollegeOtp(collegeEmail: string): Promise<{ devCode?: string }> {
  const res = await postData<{ devCode?: string }>("/verification/email/request", {
    collegeEmail,
  });
  return res.data;
}

export async function confirmCollegeOtp(
  collegeEmail: string,
  code: string,
): Promise<StudentVerification> {
  const res = await postData<{ verification: StudentVerification }>(
    "/verification/email/confirm",
    { collegeEmail, code },
  );
  return res.data.verification;
}

export async function uploadIdDocuments(files: {
  front: File;
  back?: File | null;
  selfie?: File | null;
}): Promise<StudentVerification> {
  const formData = new FormData();
  formData.append("front", files.front);
  if (files.back) formData.append("back", files.back);
  if (files.selfie) formData.append("selfie", files.selfie);

  const res = await api.post<ApiResponse<{ verification: StudentVerification }>>(
    "/verification/id",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data.verification;
}

// --- Admin ---

export async function getAdminStats(): Promise<AdminStats> {
  const res = await getData<AdminStats>("/admin/stats");
  return res.data;
}

export async function getVerificationQueue(filters?: {
  decision?: string;
  step?: string;
}): Promise<StudentVerification[]> {
  const res = await getData<{ verifications: StudentVerification[] }>(
    "/admin/verifications",
    filters,
  );
  return res.data.verifications;
}

export async function reviewVerification(
  id: string,
  action: "approve" | "reject" | "reupload",
  note?: string,
): Promise<StudentVerification> {
  const res = await api.patch<ApiResponse<{ verification: StudentVerification }>>(
    `/admin/verifications/${id}`,
    { action, note },
  );
  return res.data.data.verification;
}
