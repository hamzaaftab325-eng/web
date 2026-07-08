import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const Schema = z.object({
  icon: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const items = await db.brandValue.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ brandValues: items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
  const data = parsed.data;
  const item = await db.brandValue.create({ data: { ...data, sortOrder: data.sortOrder ?? 0, isActive: data.isActive ?? true } });
  revalidatePath("/");
  return NextResponse.json({ brandValue: item, message: "Brand value created" }, { status: 201 });
}
