import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limiting — works on Vercel serverless (Edge + Node).
 *
 * PRIMARY: Supabase Postgres via the `increment_rate_limit` RPC function
 *          (see supabase/migrations/001_rate_limit_function.sql).
 *          Atomic UPSERT + counter increment in one round-trip. Shared across
 *          all serverless instances. Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * FALLBACK: In-memory Map. Used only in dev (NODE_ENV !== "production") or when
 *           Supabase env vars are missing. NEVER silent in production — if
 *           Supabase fails in prod, we fail OPEN (allow the request through)
 *           but log the error. This is a deliberate tradeoff: better to serve
 *           traffic without rate limiting than to 500 every request.
 *
 * Uses a sliding window per IP per route pattern.
 *
 * Limits:
 * - Auth routes (login, register, forgot-password): 5 requests per 15 min
 * - Reset password: 3 requests per 15 min
 * - Refresh: 30 requests per 15 min
 * - Review submission: 10 requests per 15 min
 * - Upload: 20 requests per 5 min
 * - Contact: 5 requests per hour
 * - Subscribe: 3 requests per hour
 * - Account deletion: 3 requests per hour
 * - Default: 100 requests per minute
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory fallback store (dev only)
const memoryStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const ROUTE_LIMITS: ReadonlyArray<{ pattern: RegExp; config: RateLimitConfig }> = [
  { pattern: /\/api\/auth\/(login|register|forgot-password)/, config: { windowMs: 15 * 60 * 1000, maxRequests: 5 } },
  { pattern: /\/api\/auth\/reset-password/, config: { windowMs: 15 * 60 * 1000, maxRequests: 3 } },
  { pattern: /\/api\/auth\/refresh/, config: { windowMs: 15 * 60 * 1000, maxRequests: 30 } },
  { pattern: /\/api\/reviews\/.*$/, config: { windowMs: 15 * 60 * 1000, maxRequests: 10 } },
  { pattern: /\/api\/upload/, config: { windowMs: 5 * 60 * 1000, maxRequests: 20 } },
  { pattern: /\/api\/contact/, config: { windowMs: 60 * 60 * 1000, maxRequests: 5 } },
  { pattern: /\/api\/subscribe/, config: { windowMs: 60 * 60 * 1000, maxRequests: 3 } },
  { pattern: /\/api\/user\/data\/delete/, config: { windowMs: 60 * 60 * 1000, maxRequests: 3 } },
];

const DEFAULT_LIMIT: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 100 };

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

function getRateLimitConfig(pathname: string): RateLimitConfig {
  for (const { pattern, config } of ROUTE_LIMITS) {
    if (pattern.test(pathname)) return config;
  }
  return DEFAULT_LIMIT;
}

interface RateLimitResult {
  count: number;
  reset_at: string | null;
  allowed: boolean;
}

function buildTooManyRequestsResponse(config: RateLimitConfig, retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later.", code: "RATE_LIMITED", retryAfter: retryAfterSec },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(config.maxRequests),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

/**
 * Try Supabase RPC for an atomic rate-limit increment.
 * Returns null if allowed, or a 429 NextResponse if blocked.
 * Throws if Supabase env vars are missing or the call fails.
 */
async function checkSupabaseRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  // Accept either SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL (the URL itself is
  // not secret, so it's commonly exposed with the NEXT_PUBLIC_ prefix).
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  // The service_role key MUST stay server-side (never NEXT_PUBLIC_) — it
  // bypasses RLS.
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_rate_limit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({
      p_key: key,
      p_window_ms: config.windowMs,
      p_max: config.maxRequests,
    }),
  });

  if (!response.ok) {
    throw new Error(`Supabase RPC failed: ${response.status} ${response.statusText}`);
  }

  // PostgREST returns an array for set-returning functions
  const data = (await response.json()) as RateLimitResult | RateLimitResult[];
  const row: RateLimitResult | undefined = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error("Supabase RPC returned no rows");
  }

  if (!row.allowed) {
    const retryAfter = Math.ceil(config.windowMs / 1000);
    return buildTooManyRequestsResponse(config, retryAfter);
  }

  return null; // Allowed
}

/**
 * Check rate limit for a request.
 *
 * - Production + Supabase configured: uses Postgres RPC (atomic, shared).
 * - Production + Supabase missing/fails: fails OPEN (allows request, logs error).
 * - Dev: uses in-memory Map.
 *
 * Returns null if allowed, or 429 NextResponse if blocked.
 */
export async function checkRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const config = getRateLimitConfig(pathname);
  const key = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;

  const isProd = process.env.NODE_ENV === "production";
  const hasSupabase = Boolean(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Production path: always use Supabase (never silent in-memory fallback)
  if (isProd || hasSupabase) {
    try {
      return await checkSupabaseRateLimit(key, config);
    } catch (error) {
      // Fail OPEN in production: better to allow traffic than to 500 every request.
      // Log to server logs (Vercel picks these up).
       
      console.error("[rate-limit] Supabase RPC failed, failing OPEN:", error);
      return null;
    }
  }

  // Dev path: in-memory Map
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return buildTooManyRequestsResponse(config, retryAfter);
  }

  return null;
}

/**
 * Clean up expired entries periodically (every 5 minutes) — dev only.
 * In production, the /api/cron/cleanup route handles DB-side cleanup.
 */
let lastCleanup = 0;
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) memoryStore.delete(key);
  }
}
