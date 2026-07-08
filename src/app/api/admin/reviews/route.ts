import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

/**
 * GET /api/admin/reviews — list all reviews for moderation (admin only).
 * Supports ?status=pending|approved|rejected filter.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

    const where = status ? { status } : {};

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { product: { select: { name: true, slug: true } } },
      }),
      db.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r.id, authorName: r.authorName, authorLocation: r.authorLocation,
        rating: r.rating, title: r.title, body: r.body,
        status: r.status, verifiedBuyer: r.verifiedBuyer, helpfulCount: r.helpfulCount,
        createdAt: r.createdAt.toISOString().split("T")[0],
        product: r.product ? { name: r.product.name, slug: r.product.slug } : null,
      })),
      total, page, limit,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}
