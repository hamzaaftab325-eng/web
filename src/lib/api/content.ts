/**
 * Content API — articles, FAQ, testimonials, artisans, care guides.
 */

import { IS_MOCK, api } from "./client";
import { faqs } from "@/data/faq";
import { testimonials } from "@/data/testimonials";
import { artisans, artisanBySlug } from "@/data/artisans";
import { careGuides, careGuideBySlug } from "@/data/care-guides";
import { journalArticles } from "@/data/journal";
import type { FAQItem, Testimonial } from "@/types";
import type { Artisan } from "@/data/artisans";
import type { CareGuide } from "@/data/care-guides";

export async function getFAQ(): Promise<FAQItem[]> {
  if (IS_MOCK) return faqs;
  return api.get<FAQItem[]>("/content/faq");
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (IS_MOCK) return testimonials;
  return api.get<Testimonial[]>("/content/testimonials");
}

export async function getArtisans(): Promise<Artisan[]> {
  if (IS_MOCK) return artisans;
  return api.get<Artisan[]>("/content/artisans");
}

export async function getArtisan(slug: string): Promise<Artisan | null> {
  if (IS_MOCK) return artisanBySlug(slug) ?? null;
  return api.get<Artisan>(`/content/artisans/${slug}`);
}

export async function getCareGuides(): Promise<CareGuide[]> {
  if (IS_MOCK) return careGuides;
  return api.get<CareGuide[]>("/content/care-guides");
}

export async function getCareGuide(slug: string): Promise<CareGuide | null> {
  if (IS_MOCK) return careGuideBySlug(slug) ?? null;
  return api.get<CareGuide>(`/content/care-guides/${slug}`);
}

export async function getArticles(): Promise<typeof journalArticles> {
  if (IS_MOCK) return journalArticles;
  return api.get("/content/articles");
}
