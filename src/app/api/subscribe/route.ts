import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Schema = z.object({
  email: z.string().email(),
  source: z.string().max(50).optional(),
  promoCode: z.string().max(50).optional(),
});

/**
 * POST /api/subscribe — subscribe an email to the newsletter.
 * Public endpoint (no auth required).
 * Idempotent — if the email already exists, it just returns success.
 */
export async function POST(request: NextRequest) {
  try {
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

    // Check if already subscribed
    const existing = await db.emailSubscriber.findFirst({
      where: { email: emailLower },
    });

    if (existing) {
      return NextResponse.json({ message: "You're already subscribed!", alreadySubscribed: true });
    }

    // Create new subscriber
    await db.emailSubscriber.create({
      data: {
        email: emailLower,
        source: source ?? "footer",
        promoCode: promoCode ?? null,
      },
    });

    return NextResponse.json(
      { message: "Successfully subscribed! Check your inbox for a welcome email.", subscribed: true },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "SUBSCRIBE_ERROR" },
      { status: 500 }
    );
  }
}
