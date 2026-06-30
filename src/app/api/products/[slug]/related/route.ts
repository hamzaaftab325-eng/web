import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/products/[slug]/related — get related products (same category, excluding current).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await db.product.findUnique({ where: { slug }, select: { categoryId: true } });
    if (!product) return NextResponse.json({ products: [] });

    const related = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        slug: { not: slug },
        isActive: true,
      },
      take: 4,
      orderBy: { sortOrder: "asc" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });

    return NextResponse.json({
      products: related.map(p => ({
        id: p.id, slug: p.slug, name: p.name, price: Number(p.price),
        images: p.images.map(i => i.url), badge: p.badge, inStock: p.inStock,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}
