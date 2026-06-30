import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const Schema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().max(500).optional(),
  productSlug: z.string().max(120).optional(),
  instagramUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const items = await db.instagramPost.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ instagramPosts: items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
  const data = parsed.data;
  const item = await db.instagramPost.create({ data: { ...data, sortOrder: data.sortOrder ?? 0, isActive: data.isActive ?? true } });
  return NextResponse.json({ instagramPost: item, message: "Instagram post created" }, { status: 201 });
}
