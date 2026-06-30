import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q || q.trim().length < 2) return NextResponse.json([]);

    const products = await db.product.findMany({
      where: { isActive: true, OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { subtitle: { contains: q, mode: "insensitive" } }] },
      take: 6, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });

    await db.searchLog.create({ data: { query: q, resultsCount: products.length } }).catch(() => {});

    // 15.2: If zero results, suggest popular products
    if (products.length === 0) {
      const suggested = await db.product.findMany({
        where: { isActive: true, featured: true },
        take: 4,
        orderBy: { sortOrder: "asc" },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      });
      return NextResponse.json({
        products: [],
        suggestions: suggested.map(p => ({ id: p.id, slug: p.slug, name: p.name, subtitle: p.subtitle, price: Number(p.price), images: p.images.map(img => img.url), badge: p.badge, inStock: p.inStock })),
      });
    }

    return NextResponse.json(products.map(p => ({ id: p.id, slug: p.slug, name: p.name, subtitle: p.subtitle, description: p.description, price: Number(p.price), category: p.categoryId ?? "", images: p.images.map(img => img.url), badge: p.badge, inStock: p.inStock, featured: p.featured })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "SEARCH_ERROR" }, { status: 500 });
  }
}
