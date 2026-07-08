import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

import { verifyToken, verifyTokenWithType, signAccessToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { db } from "@/lib/db";

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

  // Check in-memory cache first (60s TTL).
  const cached = userCache.get(payload.userId);
  if (cached) {
    if (Date.now() - cached.cachedAt < CACHE_TTL) {
      return { id: cached.id, email: cached.email, role: cached.role };
    }
    userCache.delete(payload.userId);
  }

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Account not found or inactive", code: "UNAUTHORIZED" }, { status: 401 });
  }

  userCache.set(payload.userId, { id: user.id, email: user.email, role: user.role, cachedAt: Date.now() });

  return { id: user.id, email: user.email, role: user.role };
}

export async function requireAdmin(request: NextRequest): Promise<{ id: string; email: string; role: string } | NextResponse> {
  const result = await requireUser(request);
  if (result instanceof NextResponse) return result;
  if (result.role !== "admin") {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });
  }
  return result;
}

export function invalidateUserCache(userId: string): void {
  userCache.delete(userId);
}

/**
 * Phase 4A-1: Server Component auth helper.
 *
 * Uses `cookies()` from `next/headers` instead of `NextRequest`.
 *
 * IMPORTANT: This function does NOT set new cookies (that doesn't work
 * reliably in Server Component rendering). It only READS cookies to
 * verify the user. Token refresh is handled client-side by apiFetch.
 *
 * Flow:
 *   1. Try access token from cookie
 *   2. If expired, try refresh token (verify DB session exists)
 *   3. If refresh valid, use its payload (don't set new cookie here)
 *   4. Fetch user from DB for fresh role check
 *   5. If not admin → redirect("/")
 *   6. If not authenticated → redirect("/login?redirect=/admin")
 */
export async function requireAdminServer(): Promise<{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("aura_access")?.value;
  const refreshToken = cookieStore.get("aura_refresh")?.value;

  let userId: string | null = null;

  // Step 1: Try access token
  if (accessToken) {
    try {
      const payload = verifyToken(accessToken);
      userId = payload.userId;
    } catch {
      // Access token expired — try refresh below
    }
  }

  // Step 2: If access token failed, try refresh token (read-only — don't set cookie)
  if (!userId && refreshToken) {
    try {
      const refreshPayload = verifyTokenWithType(refreshToken);

      if (refreshPayload.type === "refresh") {
        // Verify session exists in DB
        const session = await db.userSession.findFirst({
          where: { userId: refreshPayload.userId, refreshToken },
          select: { id: true },
        });

        if (session) {
          userId = refreshPayload.userId;
          // NOTE: We do NOT set a new access token cookie here.
          // The client-side apiFetch will handle the refresh on the next
          // API call. Setting cookies in Server Components during RSC
          // rendering doesn't work reliably in all Next.js versions.
        }
      }
    } catch {
      // Refresh token also invalid
    }
  }

  // Step 3: Not authenticated — redirect to login
  if (!userId) {
    redirect("/login?redirect=/admin");
  }

  // Step 4: Fetch full user data from DB
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}
