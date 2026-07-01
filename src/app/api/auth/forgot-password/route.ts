import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { signAccessToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";

const schema = z.object({ email: z.string().email() });

/**
 * POST /api/auth/forgot-password
 * Generates a password reset token (JWT, 1 hour expiry) and sends it via email.
 * Always returns success (don't reveal if email exists).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid email", code: "VALIDATION_ERROR" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });

    if (user) {
      // Generate a reset token (JWT with 1 hour expiry)
      const resetToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aura-living-1.vercel.app";
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      // Send the email (fire-and-forget — don't block the response)
      const { subject, html } = passwordResetEmail(resetUrl, user.firstName);
      void sendEmail({ to: user.email, subject, html });
    }

    // Always return success — don't reveal if email exists
    return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
  } catch {
    return NextResponse.json({ error: "Request failed", code: "REQUEST_ERROR" }, { status: 500 });
  }
}
