import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { notifyAdmins } from "@/lib/notifications";
import { sanitizeHtml } from "@/lib/security";

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
      verifiedBuyer: r.verifiedBuyer, helpfulCount: r.helpfulCount, createdAt: r.createdAt.toISOString(),
    })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ productSlug: string }> }) {
  try {
    const { productSlug } = await params;
    const body = await request.json();
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
          // Check if user has a delivered order containing this product
          const orders = await db.order.findMany({
            where: { userId: user.id, status: "delivered" },
            include: { items: { where: { productSlug } } },
          });
          verifiedBuyer = orders.some(o => o.items.length > 0);
        }
      } catch { /* ignore — guest review */ }
    }

    const review = await db.review.create({
      data: {
        productId: product.id,
        ...(userId && { userId }),
        authorName: sanitizeHtml(body.authorName ?? "Anonymous"),
        authorLocation: body.authorLocation ? sanitizeHtml(body.authorLocation) : null,
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        title: body.title ? sanitizeHtml(body.title) : null,
        body: sanitizeHtml(body.body ?? ""),
        verifiedBuyer,
        status: "approved",
      },
    });

    // Notify admins about the new review (fire-and-forget)
    void notifyAdmins(
      "new_review",
      "New Review",
      `${body.authorName ?? "Someone"} left a ${Math.min(5, Math.max(1, Number(body.rating) || 5))}-star review on ${product.name}`,
      "/admin/reviews"
    );

    return NextResponse.json({ message: "Review submitted", review });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "REVIEW_ERROR" }, { status: 500 });
  }
}
