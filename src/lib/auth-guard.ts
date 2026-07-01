import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken, getRefreshToken } from "@/lib/auth-cookies";

/**
 * Edge-safe auth helper for API routes (Node.js runtime).
 *
 * Verifies the JWT from the httpOnly cookie AND fetches the user from the
 * database to check the CURRENT role — not the role that was baked into the
 * JWT at sign-in time. This is critical because admins can be promoted/
 * demoted after login; the JWT role goes stale until the next refresh.
 *
 * Returns the user object (with fresh role) if authenticated, or a 401/403
 * NextResponse if not.
 */
export async function requireUser(request: NextRequest): Promise<{ id: string; email: string; role: string } | NextResponse> {
  const accessToken = getAccessToken(request);
  let payload: { userId: string; email: string; role: string } | null = null;

  if (accessToken) {
    try { payload = verifyToken(accessToken); } catch { /* expired */ }
  }

  // Try refresh token if access is missing/expired
  if (!payload) {
    const refreshToken = getRefreshToken(request);
    if (refreshToken) {
      try { payload = verifyToken(refreshToken); } catch { /* invalid */ }
    }
  }

  if (!payload) {
    return NextResponse.json({ error: "Authentication required", code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Fetch the CURRENT user from the database (role may have changed since JWT was issued)
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Account not found or inactive", code: "UNAUTHORIZED" }, { status: 401 });
  }

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
