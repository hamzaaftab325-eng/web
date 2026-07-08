import { NextResponse } from "next/server";

import { db } from "@/lib/db";
export async function GET() {
  try {
    const items = await db.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json(items.map(t => ({ id: t.id, quote: t.quote, name: t.authorName, location: t.authorLocation ?? "", rating: t.rating, productSlug: t.productSlug ?? undefined })));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}
