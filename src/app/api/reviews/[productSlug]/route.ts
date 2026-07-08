import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { db } from "@/lib/db";
import { notifyAdmins } from "@/lib/notifications";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeHtml } from "@/lib/security";

const createReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  title: z.string().min(3, "Title must be at least 3 characters").max(120, "Title too long").optional(),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000, "Review too long (max 2000 characters)"),
  authorName: z.string().min(2, "Name must be at least 2 characters").max(60, "Name too long"),
  authorLocation: z.string().max(120, "Location too long").optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ productSlug: string }> }) {
  try {
    const { productSlug } = await params;
    const product = await db.product.findUnique({ where: { slug: productSlug } });
    if (!product) return NextResponse.json({ error: "Product not found", code: "NOT_FOUND" }, { status: 404 });

    const reviews = await db.review.findMany({
      where: { productId: product.id, status: "approved" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews.map(r => ({
      id: r.id, authorName: r.authorName, authorLocation: r.authorLocation ?? undefined,
      rating: r.rating, title: r.title ?? undefined, body: r.body,
      verifiedBuyer: r.verifiedBuyer, helpfulCount: r.helpfulCount,
      adminReply: r.adminReply ?? undefined,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ productSlug: string }> }) {
  try {
    const blocked = await rateLimit(request, 3, "1 h", `review:${getClientIp(request)}`);
    if (blocked) return blocked;

    const { productSlug } = await params;
    const body = await request.json();

    // Zod validation — reject invalid input before touching the database
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten(), code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { rating, title, body: reviewBody, authorName, authorLocation } = parsed.data;

    const product = await db.product.findUnique({ where: { slug: productSlug } });
    if (!product) return NextResponse.json({ error: "Product not found", code: "NOT_FOUND" }, { status: 404 });

    // Check if the current user has purchased this product (verified buyer)
    let verifiedBuyer = false;
    let userId: string | undefined;
    const accessToken = getAccessToken(request);
    if (accessToken) {
      try {
        const payload = verifyToken(accessToken);
        const user = await db.user.findUnique({ where: { id: payload.userId } });
        if (user) {
          userId = user.id;
          const orders = await db.order.findMany({
            where: { userId: user.id, status: "delivered" },
            include: { items: { where: { productSlug } } },
          });
          verifiedBuyer = orders.some(o => o.items.length > 0);
        }
      } catch { /* guest review */ }
    }

    // Sanitize AFTER validation — prevent XSS
    const review = await db.review.create({
      data: {
        productId: product.id,
        ...(userId && { userId }),
        authorName: sanitizeHtml(authorName),
        authorLocation: authorLocation ? sanitizeHtml(authorLocation) : null,
        rating,
        title: title ? sanitizeHtml(title) : null,
        body: sanitizeHtml(reviewBody),
        verifiedBuyer,
        status: "pending",
      },
    });

    void notifyAdmins(
      "new_review",
      "New Review",
      `${authorName} left a ${rating}-star review on ${product.name}`,
      "/admin/reviews"
    );

    return NextResponse.json({ message: "Review submitted", review });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "REVIEW_ERROR" }, { status: 500 });
  }
}
