import { postData, getData, setAccessToken } from "./api";
import type { User } from "@/types";

interface AuthResult {
  user: User;
  accessToken: string;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  role?: "student" | "ambassador";
}): Promise<AuthResult> {
  const res = await postData<AuthResult>("/auth/register", input);
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  const res = await postData<AuthResult>("/auth/login", input);
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function logout(): Promise<void> {
  await postData("/auth/logout");
  setAccessToken(null);
}

export async function getMe(): Promise<User | null> {
  try {
    const res = await getData<{ user: User }>("/auth/me");
    return res.data.user;
  } catch {
    return null;
  }
}
