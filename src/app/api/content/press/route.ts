import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try {
    const items = await db.pressFeature.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json(items.map(p => ({ id: p.id, publication: p.publication, year: p.year ?? "", tagline: p.tagline ?? "", quote: p.quote, author: p.author ?? "", authorRole: p.authorRole ?? "", featureUrl: p.featureUrl ?? "" })));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}
