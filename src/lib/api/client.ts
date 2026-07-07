/**
 * API client with automatic token refresh.
 *
 * Phase 4 hotfix: When a request returns 401 with `shouldRefresh: true`,
 * automatically calls /api/auth/refresh to get a new access token (using the
 * httpOnly refresh cookie), then retries the original request.
 *
 * If the refresh also fails (refresh token expired/invalid), THEN we redirect
 * to /login. This fixes the "logged out after 15 minutes" regression
 * introduced in Phase 1D when we removed the silent refresh-token fallback
 * from /api/auth/me.
 *
 * Auth is via httpOnly cookies — sent automatically by the browser. No manual
 * Authorization header needed (the old `getStoredToken()` plumbing is dead
 * code from before the cookie migration; removed in Phase 4).
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  retries?: number;
  /**
   * Internal: set to true to skip the auto-refresh logic (prevents infinite
   * recursion when /api/auth/refresh itself returns 401).
   */
  _skipRefresh?: boolean;
}

function buildUrl(path: string, params?: FetchOptions["params"]): string {
  const url = new URL(
    path.startsWith("http") ? path : `${process.env.NEXT_PUBLIC_API_URL ?? ""}${path}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  );
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    });
  }
  return path.startsWith("http") ? url.href : `${url.pathname}${url.search}`;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Refresh mutex ────────────────────────────────────────────────────
// If multiple concurrent requests all return 401 at once, we only want to
// call /api/auth/refresh ONCE. Subsequent requests wait for the in-flight
// refresh to complete, then retry with the new cookie.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  // If a refresh is already in-flight, wait for it
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // send httpOnly cookies
        headers: { "Content-Type": "application/json" },
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      // Clear the mutex so the next 401 can trigger a new refresh attempt
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Redirect to /login. Called only when refresh fails (refresh token expired).
 * Uses window.location for a hard navigation to clear any stale client state.
 */
function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname + window.location.search;
  // Avoid redirect loops: don't redirect if already on login/signup
  if (currentPath.startsWith("/login") || currentPath.startsWith("/signup")) return;
  // Preserve where the user was so we can send them back after login
  const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
  window.location.href = loginUrl;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, retries = 2, headers, _skipRefresh, ...rest } = options;
  const url = buildUrl(path, params);
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...rest,
        headers: requestHeaders,
        credentials: "include", // send httpOnly auth cookies
      });

      // ─── 401: try to refresh, then retry once ──────────────────────
      if (response.status === 401 && !_skipRefresh) {
        // Check if the server is hinting that we should refresh
        let shouldRefresh = true;
        try {
          const body = await response.clone().json();
          if (body?.shouldRefresh === false) shouldRefresh = false;
        } catch {
          // Not JSON — assume we should try refreshing
        }

        if (shouldRefresh) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Retry the original request ONCE with the new cookie.
            // _skipRefresh prevents infinite recursion if the retry also 401s.
            return apiFetch<T>(path, { ...options, _skipRefresh: true });
          }
        }

        // Refresh failed or server said don't refresh — redirect to login
        redirectToLogin();
        throw new ApiError("Session expired. Please log in again.", 401, "UNAUTHORIZED");
      }

      // ─── 429: rate limited — exponential backoff ───────────────────
      if (response.status === 429 && attempt < retries) {
        // Respect Retry-After header if present
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter ? Number(retryAfter) * 1000 : 1000 * Math.pow(2, attempt);
        await sleep(Math.min(delay, 30000));
        continue;
      }

      // ─── 5xx: server error — exponential backoff ───────────────────
      if (response.status >= 500 && attempt < retries) {
        await sleep(1000 * Math.pow(2, attempt));
        continue;
      }

      // ─── Other errors: throw with structured info ──────────────────
      if (!response.ok) {
        const e = await response.json().catch(() => ({}));
        throw new ApiError(
          (e as { error?: string })?.error ?? `Request failed: ${response.status}`,
          response.status,
          (e as { code?: string })?.code,
        );
      }

      // ─── Success ────────────────────────────────────────────────────
      const ct = response.headers.get("content-type");
      return ct?.includes("application/json")
        ? (response.json() as Promise<T>)
        : (response.text() as unknown as Promise<T>);
    } catch (error) {
      // Don't retry 401 errors — they've already been handled above
      if (error instanceof ApiError && error.status === 401) throw error;
      lastError = error;
      if (attempt < retries) {
        await sleep(1000 * Math.pow(2, attempt));
        continue;
      }
    }
  }

  throw lastError ?? new ApiError("Request failed", 500, "UNKNOWN");
}

export const api = {
  get: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};

export default api;
