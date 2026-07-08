import { NextResponse } from "next/server";

import { db } from "@/lib/db";
export async function GET() {
  try {
    const slides = await db.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json(slides.map(s => ({ id: s.id, image: s.imageUrl, eyebrow: s.eyebrow, headline: s.headline, subtitle: s.subtitle ?? "", ctaLabel: s.ctaLabel, ctaAction: s.ctaLink, alt: s.altText ?? s.headline })));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}
