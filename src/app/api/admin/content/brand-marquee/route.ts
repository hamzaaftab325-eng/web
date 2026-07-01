import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const Schema = z.object({
  text: z.string().min(1).max(100),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const items = await db.brandMarqueeItem.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ marqueeItems: items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
  const data = parsed.data;
  const item = await db.brandMarqueeItem.create({ data: { ...data, sortOrder: data.sortOrder ?? 0, isActive: data.isActive ?? true } });
  return NextResponse.json({ marqueeItem: item, message: "Marquee item created" }, { status: 201 });
}
