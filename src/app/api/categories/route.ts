import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: { where: { isActive: true } } } } } });
    return NextResponse.json(categories.map(c => ({ slug: c.slug, name: c.name, description: c.description ?? "", heroImage: c.heroImage ?? "", productCount: c._count.products })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}
