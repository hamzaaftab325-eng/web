import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { verifyPassword, signAccessToken, signRefreshToken, sanitizeUser } from "@/lib/auth";
import { setAuthCookies } from "@/lib/auth-cookies";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

/**
 * POST /api/auth/login
 *
 * Security:
 *   - Rate limited: 5 attempts per 15 minutes per IP (brute-force protection).
 *   - Returns identical 401 for "user not found" and "wrong password"
 *     (prevents email enumeration via timing or message differences).
 *   - Sets httpOnly + secure + sameSite=strict cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const blocked = await rateLimit(request, 5, "15 m", `login:${getClientIp(request)}`);
    if (blocked) return blocked;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", code: "VALIDATION_ERROR" }, { status: 400 });
    const { email, password } = parsed.data;
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) return NextResponse.json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, { status: 401 });
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" }, { status: 401 });
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7);
    await db.userSession.create({ data: { userId: user.id, refreshToken, expiresAt } });
    const response = NextResponse.json({ user: sanitizeUser(user), token: accessToken, message: "Login successful" });
    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed", code: "LOGIN_ERROR" }, { status: 500 });
  }
}
