import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";
import { validatePasswordStrength } from "@/lib/security";

const schema = z.object({ token: z.string().min(1), newPassword: z.string().min(8) });

/**
 * POST /api/auth/reset-password
 * Verifies the JWT token and updates the user's password.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", code: "VALIDATION_ERROR" }, { status: 400 });

    const { token, newPassword } = parsed.data;

    // Validate password strength
    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) return NextResponse.json({ error: passwordError, code: "WEAK_PASSWORD" }, { status: 400 });

    // Verify the JWT token
    let payload: { userId: string; email: string };
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid or expired reset token", code: "INVALID_TOKEN" }, { status: 400 });
    }

    // Check if user still exists
    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 });

    // Hash the new password and update
    const passwordHash = await hashPassword(newPassword);
    await db.user.update({ where: { id: user.id }, data: { passwordHash } });

    // Clear all sessions (force re-login on all devices)
    await db.userSession.deleteMany({ where: { userId: user.id } }).catch(() => {});

    return NextResponse.json({ message: "Password reset successfully. Please sign in." });
  } catch {
    return NextResponse.json({ error: "Reset failed", code: "RESET_ERROR" }, { status: 500 });
  }
}
