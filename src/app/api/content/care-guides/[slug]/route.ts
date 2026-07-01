import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const guide = await db.careGuide.findUnique({ where: { slug, isActive: true } });
    if (!guide) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json(guide);
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}
