import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, signAccessToken, signRefreshToken, sanitizeUser } from "@/lib/auth";
import { getRefreshToken, setAuthCookies, clearAuthCookies } from "@/lib/auth-cookies";

/**
 * POST /api/auth/refresh
 *
 * Refresh token rotation endpoint. Accepts a refresh token from the
 * httpOnly cookie, verifies it, checks it exists in UserSession,
 * issues NEW access + refresh tokens, deletes the old session,
 * creates a new one, and sets new cookies.
 *
 * REUSE DETECTION: If the refresh token is a valid JWT but NOT found
 * in UserSession (already used + rotated), ALL sessions for that user
 * are revoked and 401 is returned. This is the standard refresh-token-
 * rotation security pattern.
 */
export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshToken(request);
    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // Verify the JWT signature + expiry
    let payload: { userId: string; email: string; role: string; type?: string };
    try {
      payload = verifyToken(refreshToken);
    } catch {
      return NextResponse.json({ error: "Invalid refresh token", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // Reject if it's not a refresh token (e.g., someone trying to use an access token)
    if (payload.type !== "refresh") {
      return NextResponse.json({ error: "Wrong token type", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // Check if this refresh token's session still exists in the database
    const session = await db.userSession.findFirst({
      where: { userId: payload.userId, refreshToken },
      select: { id: true },
    });

    if (!session) {
      // REUSE DETECTED: The token is valid JWT but the session was already
      // consumed. This means either:
      // 1. The token was stolen and used by an attacker
      // 2. A race condition (extremely rare)
      // Either way: revoke ALL sessions for this user for safety
      await db.userSession.deleteMany({ where: { userId: payload.userId } });
      const response = NextResponse.json(
        { error: "Refresh token reuse detected. All sessions revoked.", code: "TOKEN_REUSE" },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    // Fetch the current user (check isActive, get fresh role)
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, isActive: true, createdAt: true,
        passwordHash: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Account not found or inactive", code: "UNAUTHORIZED" }, { status: 401 });
    }

    // Issue NEW tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    // Delete old session, create new one (atomic rotation)
    await db.$transaction([
      db.userSession.delete({ where: { id: session.id } }),
      db.userSession.create({
        data: {
          userId: user.id,
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
    ]);

    // Set new cookies
    const response = NextResponse.json({
      user: sanitizeUser(user),
      message: "Token refreshed",
    });
    setAuthCookies(response, newAccessToken, newRefreshToken);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Refresh failed", code: "REFRESH_ERROR" },
      { status: 500 }
    );
  }
}
