import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const review = await db.review.create({
      data: {
        productId: product.id,
        authorName: body.authorName ?? "Anonymous",
        authorLocation: body.authorLocation ?? null,
        rating: body.rating ?? 5,
        title: body.title ?? null,
        body: body.body ?? "",
        status: "pending",
      },
    });

    return NextResponse.json({ message: "Review submitted — pending moderation", review });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "REVIEW_ERROR" }, { status: 500 });
  }
}
