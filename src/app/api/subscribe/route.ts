import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const Schema = z.object({
  email: z.string().email(),
  source: z.string().max(50).optional(),
  promoCode: z.string().max(50).optional(),
});

/**
 * POST /api/subscribe — subscribe an email to the newsletter.
 *
 * Public endpoint (no auth required).
 * Idempotent — if the email already exists, it just returns success.
 *
 * Security:
 *   - Rate limited: 3 subscribes per hour per IP (prevents subscriber spam).
 */
export async function POST(request: NextRequest) {
  try {
    const blocked = await rateLimit(request, 3, "1 h", `subscribe:${getClientIp(request)}`);
    if (blocked) return blocked;

    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { email, source, promoCode } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    // Phase 2E: Use upsert instead of findFirst+create (eliminates TOCTOU race).
    // Now safe because Phase 2B added @unique to EmailSubscriber.email.
    // If two concurrent requests arrive with the same email, the second one's
    // upsert will just update the existing row instead of throwing P2002.
    //
    // To detect "already subscribed" vs "new subscriber", we check if the
    // subscriber existed before this call. We do this BEFORE the upsert to
    // avoid the timestamp-comparison fragility.
    const existing = await db.emailSubscriber.findUnique({
      where: { email: emailLower },
      select: { id: true, isActive: true },
    });

    await db.emailSubscriber.upsert({
      where: { email: emailLower },
      update: {
        // Re-subscribe if previously unsubscribed (isActive was set to false)
        isActive: true,
        ...(source && { source }),
        ...(promoCode !== undefined && { promoCode }),
      },
      create: {
        email: emailLower,
        source: source ?? "footer",
        promoCode: promoCode ?? null,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Successfully subscribed! Check your inbox for a welcome email.", subscribed: true },
        { status: 201 }
      );
    }

    if (existing.isActive) {
      return NextResponse.json({ message: "You're already subscribed!", alreadySubscribed: true });
    }

    return NextResponse.json({
      message: "Welcome back! You've been re-subscribed.",
      resubscribed: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "SUBSCRIBE_ERROR" },
      { status: 500 }
    );
  }
}
