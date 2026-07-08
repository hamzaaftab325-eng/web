import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await db.product.findUnique({
      where: { slug, isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } }, category: true, reviews: { where: { status: "approved" }, orderBy: { createdAt: "desc" }, take: 10 } },
    });
    if (!product) return NextResponse.json({ error: "Product not found", code: "NOT_FOUND" }, { status: 404 });

    // Bug fix #4: Removed server-side productView.create — PDP already tracks
    // views client-side via /api/track/product-view. This was inflating view
    // counts every time QuickView/Wishlist/RecentlyViewed called this API.

    return NextResponse.json({
      id: product.id, slug: product.slug, name: product.name, subtitle: product.subtitle ?? undefined,
      description: product.description, longDescription: product.longDescription ?? undefined,
      price: Number(product.price), compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
      category: product.category?.slug ?? "", images: product.images.map(img => img.url), badge: product.badge,
      inStock: product.inStock && product.stockQuantity > 0, stockQuantity: product.stockQuantity,
      variants: product.variants.map(v => ({ id: v.id, label: v.label, swatch: v.swatchColor ?? undefined })),
      materials: product.materials, dimensions: product.dimensions ?? undefined, careInstructions: product.careInstructions ?? undefined,
      featured: product.featured,
      reviews: product.reviews.map(r => ({ id: r.id, authorName: r.authorName, authorLocation: r.authorLocation, rating: r.rating, title: r.title, body: r.body, verifiedBuyer: r.verifiedBuyer, helpfulCount: r.helpfulCount, createdAt: r.createdAt.toISOString() })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}
