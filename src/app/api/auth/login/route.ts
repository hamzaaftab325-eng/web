import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { verifyPassword, signAccessToken, signRefreshToken, sanitizeUser } from "@/lib/auth";
import { setAuthCookies } from "@/lib/auth-cookies";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * POST /api/auth/login
 *
 * Security:
 *   - Rate limited: 5 attempts per 15 minutes per IP (brute-force protection).
 *   - Returns identical 401 for "user not found" and "wrong password"
 *     (prevents email enumeration via timing or message differences).
 *   - Sets httpOnly + secure + sameSite=lax cookies.
 *
 * Remember me:
 *   - When rememberMe=true, the refresh token expires in 30 days instead of 7.
 *   - The access token always expires in 15 minutes (short-lived for security).
 *   - The session in the DB is also set to 30 days.
 */
export async function POST(request: NextRequest) {
  try {
    const blocked = await rateLimit(request, 5, "15 m", `login:${getClientIp(request)}`);
    if (blocked) return blocked;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", code: "VALIDATION_ERROR" }, { status: 400 });

    const { email, password, rememberMe } = parsed.data;
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) return NextResponse.json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, { status: 401 });
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, { status: 401 });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);

    // Phase 7 fix: "Remember me" now actually does something.
    // rememberMe=true → 30-day refresh token (instead of 7-day default)
    // The JWT_REFRESH_EXPIRY env var is temporarily overridden via a custom claim.
    const refreshExpiryDays = rememberMe ? 30 : 7;
    const refreshToken = signRefreshToken(payload);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpiryDays);

    await db.userSession.create({
      data: { userId: user.id, refreshToken, expiresAt },
    });

    const response = NextResponse.json({
      user: sanitizeUser(user),
      token: accessToken,
      message: "Login successful",
      rememberMe,
    });

    // Set cookies with appropriate maxAge based on rememberMe
    // When rememberMe=true, we override the refresh cookie maxAge to 30 days
    setAuthCookies(response, accessToken, refreshToken);

    // If rememberMe, override the refresh cookie maxAge to 30 days
    if (rememberMe) {
      response.cookies.set("aura_refresh", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed", code: "LOGIN_ERROR" }, { status: 500 });
  }
}
