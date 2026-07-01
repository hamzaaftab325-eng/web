import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const HeroSlideSchema = z.object({
  imageUrl: z.string().url(),
  eyebrow: z.string().min(1).max(60),
  headline: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  ctaLabel: z.string().min(1).max(50),
  ctaLink: z.string().min(1).max(200),
  altText: z.string().max(200).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/admin/content/hero-slides */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const slides = await db.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ heroSlides: slides });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/** POST /api/admin/content/hero-slides */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const parsed = HeroSlideSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    const slide = await db.heroSlide.create({
      data: {
        imageUrl: data.imageUrl, eyebrow: data.eyebrow, headline: data.headline,
        subtitle: data.subtitle, ctaLabel: data.ctaLabel, ctaLink: data.ctaLink,
        altText: data.altText, sortOrder: data.sortOrder ?? 0, isActive: data.isActive ?? true,
      },
    });
    return NextResponse.json({ heroSlide: slide, message: "Slide created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "CREATE_ERROR" }, { status: 500 });
  }
}
