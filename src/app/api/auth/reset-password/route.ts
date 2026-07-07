import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";

import { db } from "@/lib/db";
import { verifyTokenWithType, hashPassword } from "@/lib/auth";
import { validatePasswordStrength } from "@/lib/security";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ token: z.string().min(1), newPassword: z.string().min(8) });

/**
 * POST /api/auth/reset-password
 *
 * Security:
 *   - Rate limited: 5 attempts per minute per IP (prevents token brute-force).
 */
export async function POST(request: NextRequest) {
  try {
    const blocked = await rateLimit(request, 5, "1 m", `reset-pw:${getClientIp(request)}`);
    if (blocked) return blocked;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", code: "VALIDATION_ERROR" }, { status: 400 });

    const { token, newPassword } = parsed.data;

    // Validate password strength
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) return NextResponse.json({ error: passwordError, code: "WEAK_PASSWORD" }, { status: 400 });

    // Verify the JWT token — must include type claim
    let payload: { userId: string; email: string; type?: string };
    try {
      payload = verifyTokenWithType(token);
    } catch {
      return NextResponse.json({ error: "Invalid or expired reset token", code: "INVALID_TOKEN" }, { status: 400 });
    }

    // Security: reject if token is not a reset token (e.g., someone using an access token)
    if (payload.type !== "reset") {
      return NextResponse.json({ error: "Invalid token type", code: "FORBIDDEN" }, { status: 403 });
    }

    // Deterministic jti: header.payload portion of the JWT (signature is the
    // secret-bound proof — we don't need it for the unique identifier).
    const jti = token.split(".").slice(0, 2).join(".");

    // Check if user still exists (avoids orphan rows in UsedResetToken)
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 });

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Transaction: blacklist token FIRST (fail fast on replay), then update
    // password + delete sessions. If the jti already exists, P2002 throws and
    // the entire transaction rolls back — so the password is NOT changed on
    // a replay attempt.
    try {
      await db.$transaction([
        db.usedResetToken.create({
          data: {
            id: randomUUID(),
            jti,
            userId: user.id,
            expiresAt: new Date(Date.now() + 16 * 60 * 1000), // 16 min — just past JWT expiry
          },
        }),
        db.user.update({
          where: { id: user.id },
          data: { passwordHash },
        }),
        db.userSession.deleteMany({ where: { userId: user.id } }),
      ]);
    } catch (error: unknown) {
      // Prisma unique-constraint violation → token already used
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        return NextResponse.json(
          { error: "This reset link has already been used", code: "TOKEN_USED" },
          { status: 410 }
        );
      }
      throw error;
    }

    return NextResponse.json({ message: "Password reset successfully. Please sign in." });
  } catch {
    return NextResponse.json({ error: "Reset failed", code: "RESET_ERROR" }, { status: 500 });
  }
}
