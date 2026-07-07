import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { signResetToken } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";
import { rateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site-url";

const schema = z.object({ email: z.string().email() });

/**
 * POST /api/auth/forgot-password
 *
 * Security:
 *   - Rate limited: 3 requests per hour per email (prevents email bombing).
 *   - Always returns 200 with the same message — does NOT reveal whether
 *     the email exists in our system (prevents email enumeration).
 *   - Reset URL uses NEXT_PUBLIC_SITE_URL (required in production).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid email", code: "VALIDATION_ERROR" }, { status: 400 });

    const blocked = await rateLimit(request, 3, "1 h", `reset:${parsed.data.email.toLowerCase()}`);
    if (blocked) return blocked;

    const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });

    if (user) {
      const resetToken = signResetToken({ userId: user.id, email: user.email, role: user.role });
      const baseUrl = getSiteUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      const { subject, html } = passwordResetEmail(resetUrl, user.firstName);
      void sendEmail({ to: user.email, subject, html });
    }

    return NextResponse.json({ message: "If the email exists, a reset link has been sent." });
  } catch {
    return NextResponse.json({ error: "Request failed", code: "REQUEST_ERROR" }, { status: 500 });
  }
}
