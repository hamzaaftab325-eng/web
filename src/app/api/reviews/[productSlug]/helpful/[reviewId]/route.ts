import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/reviews/[productSlug]/helpful/[reviewId]
 *
 * Mark a review as helpful (increments helpfulCount).
 *
 * Security:
 *   - Auth required (requireUser) — previously this endpoint was fully open,
 *     allowing anyone to inflate any review's helpful count via a simple loop.
 *   - Rate limited: 1 vote per 10 seconds per user (prevents rapid-fire spam).
 *   - Integrity check: verifies the review belongs to the product identified
 *     by `productSlug` in the URL — prevents IDOR where an attacker could
 *     vote on any review by passing an arbitrary reviewId.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ productSlug: string; reviewId: string }> }) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const blocked = await rateLimit(request, 1, "10 s", `helpful:${auth.id}`);
    if (blocked) return blocked;

    const { productSlug, reviewId } = await params;

    // Integrity check: verify the review belongs to the product identified by productSlug.
    // Prevents IDOR — without this check, an attacker could vote on any review
    // by passing an arbitrary reviewId in the URL, regardless of productSlug.
    const review = await db.review.findFirst({
      where: { id: reviewId, product: { slug: productSlug } },
      select: { id: true, helpfulCount: true },
    });
    if (!review) {
      return NextResponse.json(
        { error: "Review not found for this product", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    const updated = await db.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
      select: { helpfulCount: true },
    });

    return NextResponse.json({ helpfulCount: updated.helpfulCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json(
      { error: message, code: "FETCH_ERROR" },
      { status: 500 },
    );
  }
}
