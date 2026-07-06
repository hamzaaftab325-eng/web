import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

/**
 * Edge-safe auth helper for API routes (Node.js runtime).
 *
 * Verifies the JWT from the httpOnly cookie AND fetches the user from the
 * database to check the CURRENT role — not the role that was baked into the
 * JWT at sign-in time. This is critical because admins can be promoted/
 * demoted after login; the JWT role goes stale until the next refresh.
 *
 * SECURITY: Only access tokens are accepted. If the access token is expired,
 * returns 401 with `{ shouldRefresh: true }` so the client can call
 * `/api/auth/refresh` to get a new token pair. Refresh tokens are NEVER
 * accepted as fallback auth — they can only be used at the refresh endpoint.
 *
 * Returns the user object (with fresh role) if authenticated, or a 401/403
 * NextResponse if not.
 */

// 60-second in-memory cache for user lookups — avoids a DB round-trip on
// every authed request. Keyed by userId. Invalidated on logout.
interface CachedUser {
  id: string;
  email: string;
  role: string;
  cachedAt: number;
}
const userCache = new Map<string, CachedUser>();
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function requireUser(request: NextRequest): Promise<{ id: string; email: string; role: string } | NextResponse> {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return NextResponse.json(
      { error: "Authentication required", code: "UNAUTHORIZED", shouldRefresh: true },
      { status: 401 }
    );
  }

  let payload: { userId: string; email: string; role: string };
  try {
    payload = verifyToken(accessToken);
  } catch {
    // Access token expired or invalid — client should refresh
    return NextResponse.json(
      { error: "Token expired", code: "UNAUTHORIZED", shouldRefresh: true },
      { status: 401 }
    );
  }

  // Check in-memory cache first (60s TTL)
  const cached = userCache.get(payload.userId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return { id: cached.id, email: cached.email, role: cached.role };
  }

  // Fetch the CURRENT user from the database (role may have changed since JWT was issued)
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Account not found or inactive", code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Cache for 60 seconds
  userCache.set(payload.userId, { id: user.id, email: user.email, role: user.role, cachedAt: Date.now() });

  return { id: user.id, email: user.email, role: user.role };
}

/**
 * Require an admin user. Returns the user object if admin, or a 401/403
 * NextResponse if not authenticated / not admin.
 */
export async function requireAdmin(request: NextRequest): Promise<{ id: string; email: string; role: string } | NextResponse> {
  const result = await requireUser(request);
  if (result instanceof NextResponse) return result;
  if (result.role !== "admin") {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });
  }
  return result;
}

/**
 * Invalidate the user cache for a specific user (call on logout).
 */
export function invalidateUserCache(userId: string): void {
  userCache.delete(userId);
}
