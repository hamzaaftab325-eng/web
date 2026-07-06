const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  retries?: number;
}

function buildUrl(path: string, params?: FetchOptions["params"]): string {
  const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") url.searchParams.set(k, String(v)); });
  return path.startsWith("http") ? url.href : `${url.pathname}${url.search}`;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem("aura-auth"); return raw ? JSON.parse(raw)?.state?.token ?? null : null; } catch { return null; }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, retries = 2, headers, ...rest } = options;
  const url = buildUrl(path, params);
  const authToken = getStoredToken();
  const requestHeaders: Record<string, string> = { "Content-Type": "application/json", ...(headers as Record<string, string>) };
  if (authToken) requestHeaders["Authorization"] = `Bearer ${authToken}`;
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { ...rest, headers: requestHeaders });
      if (response.status === 401) { if (typeof window !== "undefined") localStorage.removeItem("aura-auth"); throw new ApiError("Unauthorized", 401, "UNAUTHORIZED"); }
      if (response.status === 429 && attempt < retries) { await sleep(1000 * Math.pow(2, attempt)); continue; }
      if (response.status >= 500 && attempt < retries) { await sleep(1000 * Math.pow(2, attempt)); continue; }
      if (!response.ok) { const e = await response.json().catch(() => ({})); throw new ApiError(e.error ?? `Request failed: ${response.status}`, response.status, e.code); }
      const ct = response.headers.get("content-type");
      return ct?.includes("application/json") ? response.json() as Promise<T> : response.text() as unknown as Promise<T>;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) throw error;
      lastError = error;
      if (attempt < retries) { await sleep(1000 * Math.pow(2, attempt)); continue; }
    }
  }
  throw lastError ?? new ApiError("Request failed", 500, "UNKNOWN");
}

export const api = {
  get: <T>(path: string, options?: FetchOptions) => apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: FetchOptions) => apiFetch<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: FetchOptions) => apiFetch<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: FetchOptions) => apiFetch<T>(path, { ...options, method: "DELETE" }),
};
export default api;
