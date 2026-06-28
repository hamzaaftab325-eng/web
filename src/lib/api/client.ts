/**
 * API Client — typed fetch wrapper with auth, error handling, and retry.
 *
 * BASE_URL is empty by default (uses mock data from src/data/).
 * To connect a real backend, set NEXT_PUBLIC_API_URL in .env.local:
 *   NEXT_PUBLIC_API_URL=https://api.auraliving.com
 *
 * All API functions in src/lib/api/*.ts use this client.
 * When BASE_URL is empty, they fall back to mock data.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Check if we're using a real backend (vs. mock data). */
export const IS_MOCK = !BASE_URL;

/** Custom error class for API failures. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  /** Auth token to send as Bearer. If omitted, reads from auth store. */
  token?: string;
  /** Query params to append to URL. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Retry count for transient errors (default: 2). */
  retries?: number;
}

/** Build URL with query params. */
function buildUrl(path: string, params?: FetchOptions["params"]): string {
  const url = new URL(
    path.startsWith("http") ? path : `${BASE_URL}${path}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return path.startsWith("http") ? url.href : `${url.pathname}${url.search}`;
}

/** Get auth token from localStorage (Zustand persist). */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("aura-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

/** Sleep helper for retry backoff. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Typed fetch wrapper with auth, error handling, and retry.
 *
 * - Automatically adds Authorization header if token is available
 * - Retries on 429 (rate limit) and 5xx (server error)
 * - Throws ApiError on non-2xx responses
 * - Returns parsed JSON
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, params, retries = 2, headers, ...rest } = options;

  const url = buildUrl(path, params);
  const authToken = token ?? getStoredToken();

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers as Record<string, string>,
  };

  if (authToken) {
    requestHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...rest,
        headers: requestHeaders,
      });

      if (response.status === 401) {
        // Token expired — clear auth and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("aura-auth");
        }
        throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
      }

      if (response.status === 429) {
        // Rate limited — wait and retry
        if (attempt < retries) {
          await sleep(1000 * Math.pow(2, attempt));
          continue;
        }
      }

      if (response.status >= 500) {
        // Server error — retry with backoff
        if (attempt < retries) {
          await sleep(1000 * Math.pow(2, attempt));
          continue;
        }
        throw new ApiError(
          `Server error: ${response.status}`,
          response.status,
          "SERVER_ERROR"
        );
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new ApiError(
          errorBody.message ?? `Request failed: ${response.status}`,
          response.status,
          errorBody.code
        );
      }

      // Parse JSON response
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return response.json() as Promise<T>;
      }
      return response.text() as unknown as Promise<T>;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw error; // Don't retry auth errors
      }
      lastError = error;
      if (attempt < retries) {
        await sleep(1000 * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError ?? new ApiError("Request failed", 500, "UNKNOWN");
}

/** Convenience methods. */
export const api = {
  get: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};

export default api;
