import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const review = await db.review.update({ where: { id }, data: { helpfulCount: { increment: 1 } } });
    return NextResponse.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}
