"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { FAQItem, Testimonial, CareGuide, JournalArticle, HeroSlide, PressItem, BrandValue, InstagramPost } from "@/types";

interface MarqueeItem { id: string; text: string; }

export function useFAQ() { return useQuery({ queryKey: ["content","faq"], queryFn: () => api.get<FAQItem[]>("/api/content/faq").catch(() => []) }); }
export function useTestimonials() { return useQuery({ queryKey: ["content","testimonials"], queryFn: () => api.get<Testimonial[]>("/api/content/testimonials").catch(() => []) }); }
export function useCareGuides() { return useQuery({ queryKey: ["content","care-guides"], queryFn: () => api.get<CareGuide[]>("/api/content/care-guides").catch(() => []) }); }
export function useArticles() { return useQuery({ queryKey: ["content","journal"], queryFn: () => api.get<JournalArticle[]>("/api/content/journal").catch(() => []) }); }
export function useHeroSlides() { return useQuery({ queryKey: ["content","hero-slides"], queryFn: () => api.get<HeroSlide[]>("/api/content/hero-slides").catch(() => []) }); }
export function usePressFeatures() { return useQuery({ queryKey: ["content","press"], queryFn: () => api.get<PressItem[]>("/api/content/press").catch(() => []) }); }
export function useBrandValues() { return useQuery({ queryKey: ["content","brand-values"], queryFn: () => api.get<BrandValue[]>("/api/content/brand-values").catch(() => []) }); }
export function useInstagramPosts() { return useQuery({ queryKey: ["content","instagram"], queryFn: () => api.get<InstagramPost[]>("/api/content/instagram").catch(() => []) }); }
export function useBrandMarquee() { return useQuery({ queryKey: ["content","brand-marquee"], queryFn: () => api.get<MarqueeItem[]>("/api/content/brand-marquee").catch(() => []) }); }
