import { api } from "./client";
import type { FAQItem, Testimonial, CareGuide, JournalArticle, HeroSlide, PressItem, BrandValue, InstagramPost } from "@/types";
export async function getFAQ(): Promise<FAQItem[]> { return api.get<FAQItem[]>("/api/content/faq"); }
export async function getTestimonials(): Promise<Testimonial[]> { return api.get<Testimonial[]>("/api/content/testimonials"); }
export async function getCareGuides(): Promise<CareGuide[]> { return api.get<CareGuide[]>("/api/content/care-guides"); }
export async function getCareGuide(slug: string): Promise<CareGuide | null> { return api.get<CareGuide>(`/api/content/care-guides/${slug}`); }
export async function getArticles(): Promise<JournalArticle[]> { return api.get<JournalArticle[]>("/api/content/journal"); }
export async function getArticle(slug: string): Promise<JournalArticle | null> { return api.get<JournalArticle>(`/api/content/journal/${slug}`); }
export async function getHeroSlides(): Promise<HeroSlide[]> { return api.get<HeroSlide[]>("/api/content/hero-slides"); }
export async function getPressFeatures(): Promise<PressItem[]> { return api.get<PressItem[]>("/api/content/press"); }
export async function getBrandValues(): Promise<BrandValue[]> { return api.get<BrandValue[]>("/api/content/brand-values"); }
export async function getInstagramPosts(): Promise<InstagramPost[]> { return api.get<InstagramPost[]>("/api/content/instagram"); }
