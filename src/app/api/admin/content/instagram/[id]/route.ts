import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const Schema = z.object({
  imageUrl: z.string().url().optional(),
  caption: z.string().max(500).nullable().optional(),
  productSlug: z.string().max(120).nullable().optional(),
  instagramUrl: z.string().url().nullable().optional(),
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
  const item = await db.instagramPost.update({ where: { id }, data: parsed.data });
  revalidatePath("/");
  return NextResponse.json({ instagramPost: item, message: "Instagram post updated" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await db.instagramPost.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ message: "Instagram post deleted" });
}
