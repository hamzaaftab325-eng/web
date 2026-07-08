import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const JournalUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
  category: z.string().min(1).max(50).optional(),
  excerpt: z.string().min(1).max(500).optional(),
  body: z.string().min(1).optional(),
  heroImage: z.string().url().optional(),
  author: z.string().min(1).max(100).optional(),
  readTime: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

/** PUT /api/admin/content/journal/[id] */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await request.json();
    const parsed = JournalUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    if (data.slug) {
      const existing = await db.journalArticle.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) return NextResponse.json({ error: "Slug already in use", code: "CONFLICT" }, { status: 409 });
    }
    const article = await db.journalArticle.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.body !== undefined && { body: data.body as never }),
        ...(data.heroImage !== undefined && { heroImage: data.heroImage }),
        ...(data.author !== undefined && { author: data.author }),
        ...(data.readTime !== undefined && { readTime: data.readTime }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt ? new Date(data.publishedAt) : null }),
      },
    });
    revalidatePath("/");
    revalidatePath("/journal")
    revalidatePath("/journal/[slug]");
    return NextResponse.json({ article, message: "Article updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

/** DELETE /api/admin/content/journal/[id] */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    await db.journalArticle.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/journal")
    revalidatePath("/journal/[slug]");
    return NextResponse.json({ message: "Article deleted" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "DELETE_ERROR" }, { status: 500 });
  }
}
