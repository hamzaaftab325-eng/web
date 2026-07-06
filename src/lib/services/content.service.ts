/**
 * Content Service — central data access for editorial content.
 *
 * Handles: FAQ, Testimonials, Brand Values, Journal Articles,
 * Care Guides, Instagram Posts, Hero Slides.
 */

import { db } from "@/lib/db";
import type { JournalBodyBlock } from "@/types";

// ── DTO Types ──────────────────────────────────────────────────────────

export interface FAQDTO {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface TestimonialDTO {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  productSlug: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface BrandValueDTO {
  id: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface JournalArticleDTO {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  heroImage: string;
  body: JournalBodyBlock[];
  author: string;
  readTime: number;
  publishedAt: string;
}

export interface CareGuideDTO {
  id: string;
  slug: string;
  title: string;
  material: string;
  excerpt: string;
  body: { type: "paragraph" | "heading" | "list"; text?: string; items?: string[] }[];
  sortOrder: number;
  isActive: boolean;
}


export interface HeroSlideContentDTO {
  id: string;
  image: string;
  eyebrow: string;
  headline: string;
  subtitle: string;
  ctaLabel: string;
  ctaAction: string;
  alt: string;
}

// ── FAQ ────────────────────────────────────────────────────────────────

export async function getFAQ(): Promise<FAQDTO[]> {
  try {
    const items = await db.faqItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return items.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category,
      sortOrder: f.sortOrder,
      isActive: f.isActive,
    }));
  } catch {
    return [];
  }
}

// ── Testimonials ───────────────────────────────────────────────────────

export async function getTestimonials(): Promise<TestimonialDTO[]> {
  try {
    const items = await db.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return items.map((t) => ({
      id: t.id,
      name: t.authorName,
      location: t.authorLocation ?? "",
      rating: t.rating,
      quote: t.quote,
      productSlug: t.productSlug,
      sortOrder: t.sortOrder,
      isActive: t.isActive,
    }));
  } catch {
    return [];
  }
}

// ── Brand Values ───────────────────────────────────────────────────────

export async function getBrandValues(): Promise<BrandValueDTO[]> {
  try {
    const items = await db.brandValue.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return items.map((v) => ({
      id: v.id,
      icon: v.icon,
      title: v.title,
      description: v.description,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
    }));
  } catch {
    return [];
  }
}

// ── Journal Articles ───────────────────────────────────────────────────

export async function getArticles(): Promise<JournalArticleDTO[]> {
  try {
    const articles = await db.journalArticle.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return articles.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      heroImage: a.heroImage,
      body: (a.body as unknown as JournalBodyBlock[]) ?? [],
      author: a.author,
      readTime: a.readTime ?? 0,
      publishedAt: a.publishedAt?.toISOString() ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<JournalArticleDTO | null> {
  try {
    const article = await db.journalArticle.findUnique({
      where: { slug, isActive: true },
    });
    if (!article) return null;
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      heroImage: article.heroImage,
      body: (article.body as unknown as JournalBodyBlock[]) ?? [],
      author: article.author,
      readTime: article.readTime ?? 0,
      publishedAt: article.publishedAt?.toISOString() ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Care Guides ────────────────────────────────────────────────────────

export async function getCareGuides(): Promise<CareGuideDTO[]> {
  try {
    const guides = await db.careGuide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return guides.map((g) => ({
      id: g.id,
      slug: g.slug,
      title: g.title,
      material: g.material,
      excerpt: g.excerpt,
      body: (g.body as { type: "paragraph" | "heading" | "list"; text?: string; items?: string[] }[]) ?? [],
      sortOrder: g.sortOrder,
      isActive: g.isActive,
    }));
  } catch {
    return [];
  }
}

// ── Hero Slides ────────────────────────────────────────────────────────

export async function getHeroSlides(): Promise<HeroSlideContentDTO[]> {
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
    }));
  } catch {
    return [];
  }
}
