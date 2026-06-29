import axios, { type AxiosInstance } from "axios";
import type { ApiResponse } from "@/types";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("cc_token", token);
    else localStorage.removeItem("cc_token");
  }
}

export function loadAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("cc_token");
  }
  return accessToken;
}

api.interceptors.request.use((config) => {
  const token = loadAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getData<T>(url: string, params?: Record<string, unknown>) {
  const res = await api.get<ApiResponse<T>>(url, { params });
  return res.data;
}

export async function postData<T>(url: string, body?: unknown) {
  const res = await api.post<ApiResponse<T>>(url, body);
  return res.data;
}
