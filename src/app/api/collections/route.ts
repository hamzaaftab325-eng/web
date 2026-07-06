import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const collections = await db.collection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    const transformed = await Promise.all(collections.map(async c => {
      const productLinks = await db.productCollection.findMany({ where: { collectionId: c.id }, include: { product: { select: { slug: true, isActive: true } } } });
      return { slug: c.slug, name: c.name, description: c.description ?? "", heroImage: c.heroImage ?? "", productSlugs: productLinks.filter(pl => pl.product.isActive).map(pl => pl.product.slug) };
    }));
    return NextResponse.json(transformed);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}
