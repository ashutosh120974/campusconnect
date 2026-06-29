import type { ApiResponse } from "@/types";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

/**
 * Server-side fetch helper for React Server Components.
 * Returns null on failure so pages can render graceful fallbacks
 * (e.g. when the backend or database is not running).
 */
export async function fetchServer<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<ApiResponse<T> | null> {
  const url = new URL(`${baseURL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}
