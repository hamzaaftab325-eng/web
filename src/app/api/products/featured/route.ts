import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.product.findMany({ where: { isActive: true, featured: true }, orderBy: { sortOrder: "asc" }, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } });
    return NextResponse.json(products.map(p => ({ id: p.id, slug: p.slug, name: p.name, subtitle: p.subtitle, description: p.description, price: Number(p.price), category: p.categoryId ?? "", images: p.images.map(img => img.url), badge: p.badge, inStock: p.inStock, featured: p.featured })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}
