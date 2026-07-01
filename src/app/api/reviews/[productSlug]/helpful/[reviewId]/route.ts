import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/reviews/[productSlug]/helpful/[reviewId]
 * Mark a review as helpful (increments helpfulCount).
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ productSlug: string; reviewId: string }> }) {
  try {
    const { reviewId } = await params;
    const review = await db.review.update({ where: { id: reviewId }, data: { helpfulCount: { increment: 1 } } });
    return NextResponse.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}
