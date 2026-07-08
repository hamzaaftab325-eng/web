import { NextResponse } from "next/server";

import { db } from "@/lib/db";
export async function GET() {
  try {
    const guides = await db.careGuide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json(guides);
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}
