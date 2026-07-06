/**
 * Hero Service — central data access for hero slide reads.
 */

import { db } from "@/lib/db";

export interface HeroSlideDTO {
  id: string;
  image: string;
  eyebrow: string;
  headline: string;
  subtitle: string;
  ctaLabel: string;
  ctaAction: string;
  alt: string;
  sortOrder: number;
  isActive: boolean;
}

/**
 * Get all active hero slides, ordered by sortOrder.
 * Used by: Home page HeroSlider, /api/content/hero-slides
 */
export async function getActiveSlides(): Promise<HeroSlideDTO[]> {
  try {
    const slides = await db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    return slides.map((s) => ({
      id: s.id,
      image: s.imageUrl,
      eyebrow: s.eyebrow,
      headline: s.headline,
      subtitle: s.subtitle ?? "",
      ctaLabel: s.ctaLabel,
      ctaAction: s.ctaLink,
      alt: s.altText ?? s.headline,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    }));
  } catch {
    return [];
  }
}
