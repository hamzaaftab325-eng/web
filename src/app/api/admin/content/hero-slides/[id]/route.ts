import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const SlideUpdateSchema = z.object({
  imageUrl: z.string().url().optional(),
  eyebrow: z.string().min(1).max(60).optional(),
  headline: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(300).nullable().optional(),
  ctaLabel: z.string().min(1).max(50).optional(),
  ctaLink: z.string().min(1).max(200).optional(),
  altText: z.string().max(200).nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** PUT /api/admin/content/hero-slides/[id] */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await request.json();
    const parsed = SlideUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    const slide = await db.heroSlide.update({
      where: { id },
      data: {
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.eyebrow !== undefined && { eyebrow: data.eyebrow }),
        ...(data.headline !== undefined && { headline: data.headline }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.ctaLabel !== undefined && { ctaLabel: data.ctaLabel }),
        ...(data.ctaLink !== undefined && { ctaLink: data.ctaLink }),
        ...(data.altText !== undefined && { altText: data.altText }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return NextResponse.json({ heroSlide: slide, message: "Slide updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

/** DELETE /api/admin/content/hero-slides/[id] */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    await db.heroSlide.delete({ where: { id } });
    return NextResponse.json({ message: "Slide deleted" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "DELETE_ERROR" }, { status: 500 });
  }
}
