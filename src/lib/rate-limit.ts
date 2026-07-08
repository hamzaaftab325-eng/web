import { NextRequest, NextResponse } from "next/server";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";


/**
 * Distributed rate limiting backed by Upstash Redis.
 *
 * Why Upstash (not in-memory Map):
 *   - Vercel serverless runs many instances in parallel — an in-memory Map
 *     is per-instance, so an attacker spawning requests across instances
 *     gets N× the rate limit. Upstash is shared across all instances.
 *   - Upstash uses Redis over HTTP (REST API), so it works in both Node.js
 *     and Edge runtimes without persistent connections.
 *
 * Env vars required:
 *   UPSTASH_REDIS_REST_URL  — e.g. https://creative-buffalo-158135.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN — server-side only, never NEXT_PUBLIC_
 *
 * If env vars are missing, rate limiting is DISABLED with a console.warn.
 * This is a deliberate graceful-degradation choice — the app still works,
 * but production deploys MUST set the env vars to actually be protected.
 */

let _redis: Redis | null = null;
const _ratelimiters = new Map<string, Ratelimit>();
let initWarningLogged = false;

function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!initWarningLogged) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — " +
        "rate limiting is DISABLED. Set these env vars in production to enable protection.",
      );
      initWarningLogged = true;
    }
    return null;
  }

  _redis = new Redis({ url, token });
  return _redis;
}

// Duration type from Upstash — supports formats like "15 m", "1h", "10 s".
type Duration = `${number} ${"ms" | "s" | "m" | "h" | "d"}` | `${number}${"ms" | "s" | "m" | "h" | "d"}`;

/**
 * Get (or create) a Ratelimit instance for a specific (limit, window) tuple.
 *
 * Upstash's `Ratelimit` constructor requires the `limiter` to be baked in at
 * construction time (it's an `Algorithm`, not a function). We cache one
 * Ratelimit per (limit, window) pair so we don't re-instantiate on every call.
 */
function getRatelimiter(limit: number, window: Duration): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const cacheKey = `${limit}:${window}`;
  let limiter = _ratelimiters.get(cacheKey);
  if (limiter) return limiter;

  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `aura-living:ratelimit:${cacheKey}`,
    analytics: true,
  });
  _ratelimiters.set(cacheKey, limiter);
  return limiter;
}

/**
 * Apply a sliding-window rate limit to a request.
 *
 * @param request    The NextRequest — used to extract the client identifier.
 * @param limit      Max requests allowed in the window.
 * @param window     Window duration — Upstash Duration format like "15 m", "1 h", "10 s".
 * @param identifier Optional override — by default uses IP from request headers.
 *                   Pass a custom value to rate-limit by email, userId, etc.
 *
 * @returns `null` if the request is allowed, or a `NextResponse` (429) if blocked.
 *         The 429 response includes `Retry-After` header and JSON body.
 *
 * @example
 *   const blocked = await rateLimit(request, 5, "15 m");
 *   if (blocked) return blocked;
 */
export async function rateLimit(
  request: NextRequest,
  limit: number,
  window: Duration,
  identifier?: string,
): Promise<NextResponse | null> {
  const limiter = getRatelimiter(limit, window);
  if (!limiter) return null;

  const key = identifier ?? `ip:${getClientIp(request)}`;

  const { success, reset, remaining } = await limiter.limit(key);

  if (success) return null;

  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));

  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      code: "RATE_LIMITED",
      retryAfter: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      },
    },
  );
}

/**
 * Extract the client IP from a NextRequest.
 *
 * Checks the standard forwarded-IP headers in order of preference:
 *   1. X-Forwarded-For (first IP, set by Vercel/Cloudflare/etc.)
 *   2. CF-Connecting-IP (Cloudflare-specific)
 *   3. X-Real-IP (Nginx convention)
 *
 * Returns "anon" if no IP can be determined (e.g. local dev without proxy).
 */
export function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "anon";
}
