import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const Schema = z.object({
  publication: z.string().min(1).max(100).optional(),
  year: z.string().max(10).nullable().optional(),
  tagline: z.string().max(100).nullable().optional(),
  quote: z.string().min(1).max(500).optional(),
  author: z.string().max(100).nullable().optional(),
  authorRole: z.string().max(100).nullable().optional(),
  featureUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
  const item = await db.pressFeature.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ pressFeature: item, message: "Press feature updated" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await db.pressFeature.delete({ where: { id } });
  return NextResponse.json({ message: "Press feature deleted" });
}
