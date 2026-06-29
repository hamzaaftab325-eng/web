import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const CollectionUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).nullable().optional(),
  heroImage: z.string().url().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** PUT /api/admin/content/collections/[id] */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await request.json();
    const parsed = CollectionUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    if (data.slug) {
      const existing = await db.collection.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) return NextResponse.json({ error: "Slug already in use", code: "CONFLICT" }, { status: 409 });
    }
    const collection = await db.collection.update({ where: { id }, data });
    return NextResponse.json({ collection, message: "Collection updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

/** DELETE /api/admin/content/collections/[id] */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    await db.collection.delete({ where: { id } });
    return NextResponse.json({ message: "Collection deleted" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "DELETE_ERROR" }, { status: 500 });
  }
}
