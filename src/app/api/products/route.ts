import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const collection = searchParams.get("collection");
    const sort = searchParams.get("sort") ?? "featured";
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    // Phase 3F: Use Prisma.ProductWhereInput for compile-time type safety.
    const where: Prisma.ProductWhereInput = { isActive: true };
    if (category && category !== "all") where.category = { slug: category };
    if (collection) where.collections = { some: { collection: { slug: collection } } };
    if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }, { subtitle: { contains: search, mode: "insensitive" } }];

    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sort) {
      case "price-asc": orderBy = { price: "asc" }; break;
      case "price-desc": orderBy = { price: "desc" }; break;
      case "newest": orderBy = { createdAt: "desc" }; break;
      default: orderBy = { sortOrder: "asc" };
    }

    const [products, total] = await Promise.all([
      db.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } }, category: true } }),
      db.product.count({ where }),
    ]);

    const transformed = products.map(p => ({
      id: p.id, slug: p.slug, name: p.name, subtitle: p.subtitle ?? undefined, description: p.description,
      longDescription: p.longDescription ?? undefined, price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
      category: p.category?.slug ?? "", images: p.images.map(img => img.url),
      badge: p.badge, inStock: p.inStock && (p.stockQuantity ?? 0) > 0,
      variants: p.variants.map(v => ({ id: v.id, label: v.label, swatch: v.swatchColor ?? undefined })),
      materials: p.materials, dimensions: p.dimensions ?? undefined, careInstructions: p.careInstructions ?? undefined, featured: p.featured,
    }));

    return NextResponse.json({ products: transformed, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}
