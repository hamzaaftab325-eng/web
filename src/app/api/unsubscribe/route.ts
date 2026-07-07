import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/unsubscribe — unsubscribe an email.
 *
 * Phase 2E: Now supports TWO query param formats:
 *
 *   1. Modern (preferred): ?token=xxx
 *      - Looks up EmailSubscriber by unsubscribeToken (Phase 2B field).
 *      - CSRF-safe: token is a random CUID that can't be guessed.
 *      - Used by new email templates.
 *
 *   2. Legacy (deprecated): ?email=xxx
 *      - Keeps backward compat with old email links sent before Phase 2E.
 *      - Known CSRF-via-GET risk — kept only for transition.
 *      - Will be removed in a future phase once all old emails are aged out.
 *
 * Both flows are rate-limited: 3 unsubscribes per hour per IP.
 * Both return the same success message regardless of whether the subscriber
 * existed (prevents enumeration).
 *
 * Note: We soft-delete (set isActive=false) rather than hard-delete so we can
 * distinguish "actively subscribed" from "previously unsubscribed". The
 * subscribe endpoint re-activates if they re-subscribe.
 */
export async function GET(request: NextRequest) {
  try {
    const blocked = await rateLimit(request, 3, "1 h", `unsubscribe:${getClientIp(request)}`);
    if (blocked) return blocked;

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (token) {
      // Modern flow: token-based
      const tokenSchema = z.string().min(1).max(100);
      const parsed = tokenSchema.safeParse(token);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid token", code: "VALIDATION_ERROR" },
          { status: 400 },
        );
      }

      const subscriber = await db.emailSubscriber.findUnique({
        where: { unsubscribeToken: parsed.data },
        select: { id: true, isActive: true },
      });

      if (subscriber && subscriber.isActive) {
        await db.emailSubscriber.update({
          where: { id: subscriber.id },
          data: { isActive: false },
        });
      }
      // Same response regardless of whether subscriber existed
      return NextResponse.json({ message: "Unsubscribed successfully" });
    }

    if (email) {
      // Legacy flow: email-based (deprecated, kept for old email links)
      const emailSchema = z.string().email();
      const parsed = emailSchema.safeParse(email);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid email", code: "VALIDATION_ERROR" },
          { status: 400 },
        );
      }

      const subscriber = await db.emailSubscriber.findUnique({
        where: { email: parsed.data.toLowerCase() },
        select: { id: true, isActive: true },
      });

      if (subscriber && subscriber.isActive) {
        await db.emailSubscriber.update({
          where: { id: subscriber.id },
          data: { isActive: false },
        });
      }
      return NextResponse.json({ message: "Unsubscribed successfully" });
    }

    return NextResponse.json(
      { error: "Token or email required", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed", code: "UNSUBSCRIBE_ERROR" },
      { status: 500 },
    );
  }
}

const unsubscribeSchema = z.object({
  email: z.string().email().optional(),
  token: z.string().min(1).max(100).optional(),
}).refine((data) => data.email || data.token, {
  message: "Either email or token is required",
});

/**
 * POST /api/unsubscribe — unsubscribe via JSON body (modern, CSRF-safe).
 *
 * Body: { token?: "xxx" } OR { email?: "user@example.com" }
 *
 * Token-based is preferred (CSRF-safe). Email-based kept for clients that
 * don't have the token handy.
 */
export async function POST(request: NextRequest) {
  try {
    const blocked = await rateLimit(request, 3, "1 h", `unsubscribe-post:${getClientIp(request)}`);
    if (blocked) return blocked;

    const body = await request.json();
    const parsed = unsubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { token, email } = parsed.data;

    let subscriber: { id: string; isActive: boolean } | null = null;

    if (token) {
      subscriber = await db.emailSubscriber.findUnique({
        where: { unsubscribeToken: token },
        select: { id: true, isActive: true },
      });
    } else if (email) {
      subscriber = await db.emailSubscriber.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, isActive: true },
      });
    }

    if (subscriber && subscriber.isActive) {
      await db.emailSubscriber.update({
        where: { id: subscriber.id },
        data: { isActive: false },
      });
    }

    return NextResponse.json({ message: "Unsubscribed successfully" });
  } catch {
    return NextResponse.json(
      { error: "Failed", code: "UNSUBSCRIBE_ERROR" },
      { status: 500 },
    );
  }
}
