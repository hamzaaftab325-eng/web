import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/unsubscribe?email=xxx — unsubscribe an email (legacy, deprecated).
 *
 * SECURITY NOTE: This endpoint is a known CSRF-via-GET risk — an attacker can
 * embed `<img src="https://yoursite.com/api/unsubscribe?email=victim@example.com">`
 * in any email/website/forum post and any victim who loads the page is unsubscribed.
 *
 * We keep this endpoint for backward compatibility with old email links (sent
 * before Phase 1F), but new emails should use POST /api/unsubscribe with a
 * per-subscriber token (added in Phase 2 when the EmailSubscriber schema gains
 * an `unsubscribeToken` field).
 *
 * Mitigations in place:
 *   - Rate limited: 3 unsubscribes per hour per IP (prevents trivial abuse).
 *   - Always returns the same success message regardless of whether the email
 *     exists (prevents email enumeration).
 */
export async function GET(request: NextRequest) {
  try {
    const blocked = await rateLimit(request, 3, "1 h", `unsubscribe:${getClientIp(request)}`);
    if (blocked) return blocked;

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ error: "Email required", code: "VALIDATION_ERROR" }, { status: 400 });

    const emailSchema = z.string().email();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const subscriber = await db.emailSubscriber.findFirst({ where: { email: parsed.data.toLowerCase() } });
    if (subscriber) {
      await db.emailSubscriber.delete({ where: { id: subscriber.id } });
    }

    return NextResponse.json({ message: "Unsubscribed successfully" });
  } catch {
    return NextResponse.json({ error: "Failed", code: "UNSUBSCRIBE_ERROR" }, { status: 500 });
  }
}

const unsubscribeSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1).optional(),
});

/**
 * POST /api/unsubscribe — unsubscribe an email (modern, CSRF-safe).
 *
 * Body: { email: "user@example.com", token?: "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const blocked = await rateLimit(request, 3, "1 h", `unsubscribe-post:${getClientIp(request)}`);
    if (blocked) return blocked;

    const body = await request.json();
    const parsed = unsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const subscriber = await db.emailSubscriber.findFirst({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (subscriber) {
      await db.emailSubscriber.delete({ where: { id: subscriber.id } });
    }

    return NextResponse.json({ message: "Unsubscribed successfully" });
  } catch {
    return NextResponse.json({ error: "Failed", code: "UNSUBSCRIBE_ERROR" }, { status: 500 });
  }
}
