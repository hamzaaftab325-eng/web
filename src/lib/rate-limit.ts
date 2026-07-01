import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limiting middleware — in-memory rate limiter for Edge Runtime.
 *
 * Uses a sliding window approach: tracks requests per IP per route pattern.
 * Resets after the window expires.
 *
 * Limits:
 * - Auth routes (login, register, forgot-password): 5 requests per 15 min
 * - Review submission: 10 requests per 15 min
 * - API general: 100 requests per minute
 * - Upload: 20 requests per 5 min
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const ROUTE_LIMITS: Array<{ pattern: RegExp; config: RateLimitConfig }> = [
  { pattern: /\/api\/auth\/(login|register|forgot-password)/, config: { windowMs: 15 * 60 * 1000, maxRequests: 5 } },
  { pattern: /\/api\/auth\/reset-password/, config: { windowMs: 15 * 60 * 1000, maxRequests: 3 } },
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

/**
 * Check rate limit for a request. Returns null if allowed, or a NextResponse
 * with 429 status if rate limited.
 */
export function checkRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const config = getRateLimitConfig(pathname);

  const key = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        code: "RATE_LIMITED",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(config.maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(entry.resetTime),
        },
      }
    );
  }

  return null;
}

/**
 * Clean up expired entries periodically (every 5 minutes).
 * Called on each request but only runs cleanup if last cleanup was > 5 min ago.
 */
let lastCleanup = 0;
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) store.delete(key);
  }
}
