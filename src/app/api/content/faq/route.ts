import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try {
    const items = await db.faqItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json(items.map(f => ({ id: f.id, category: f.category, question: f.question, answer: f.answer })));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}
