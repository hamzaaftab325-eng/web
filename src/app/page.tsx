import type { Metadata } from "next";
import { homeMetadata } from "@/lib/seo-metadata";
import { HeroSlider } from "@/components/aura/sections/HeroSlider";
import { CategoryShowcase } from "@/components/aura/sections/CategoryShowcase";
import { FeaturedProducts } from "@/components/aura/sections/FeaturedProducts";
import { CuratedCollection } from "@/components/aura/sections/CuratedCollection";
import { TestimonialSection } from "@/components/aura/sections/TestimonialSection";
import { BrandValues } from "@/components/aura/sections/BrandValues";
import { InstagramFeed } from "@/components/aura/sections/InstagramFeed";
import { RecentlyViewed } from "@/components/aura/commerce/RecentlyViewed";
import { NewsletterSection } from "@/components/aura/sections/NewsletterSection";
import { FAQSection } from "@/components/aura/sections/FAQSection";
import { RecommendedForYou } from "@/components/aura/personalization/RecommendedForYou";
import * as heroService from "@/lib/services/hero.service";
import * as productService from "@/lib/services/product.service";
import * as categoryService from "@/lib/services/category.service";
import * as collectionService from "@/lib/services/collection.service";
import * as contentService from "@/lib/services/content.service";

// Note: BrandValues and InstagramFeed use hardcoded data (no DB fetch needed).

// Revalidate every 5 minutes — products/featured change occasionally.
// Hero/testimonials/FAQ change rarely but share the page, so 5 min is a
// good balance between freshness and performance.
export const revalidate = 300;

export const metadata: Metadata = homeMetadata();

/**
 * Home page — async server component.
 *
 * Fetches ALL public data server-side via the service layer using Promise.all
 * for parallel execution. Data arrives in the HTML on first paint — no
 * client-side spinners, no API round-trips, no waterfall requests.
 *
 * Sections that need user context (RecommendedForYou, RecentlyViewed) stay
 * client-side and are not fetched here.
 */
export default async function Home() {
  // Parallel fetch — all independent queries run simultaneously.
  // BrandValues and InstagramFeed use hardcoded data (no DB fetch needed).
  // Wrap in try/catch so the page still renders if DB is unreachable
  // (sections fall back to client-side TanStack Query fetching).
  let slides: heroService.HeroSlideDTO[] = [];
  let featured: productService.ProductListItem[] = [];
  let categories: categoryService.CategoryDTO[] = [];
  let collections: collectionService.CollectionDTO[] = [];
  let testimonials: contentService.TestimonialDTO[] = [];
  let faq: contentService.FAQDTO[] = [];
  try {
    [slides, featured, categories, collections, testimonials, faq] = await Promise.all([
      heroService.getActiveSlides(),
      productService.getFeatured(),
      categoryService.getAll(),
      collectionService.getAll(),
      contentService.getTestimonials(),
      contentService.getFAQ(),
    ]);
  } catch {
    // DB unreachable — sections will fall back to client-side fetching
    // (defaults already set above).
  }

  // FAQPage structured data — enables FAQ rich results in Google Search
  const faqJsonLd = faq && faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  } : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <HeroSlider initialSlides={slides.length > 0 ? slides : undefined} />
      <RecommendedForYou />
      <CategoryShowcase initialCategories={categories} initialProducts={featured} />
      <FeaturedProducts initialProducts={featured} />
      <CuratedCollection initialCollections={collections} />
      <TestimonialSection initialTestimonials={testimonials} />
      <BrandValues />
      <InstagramFeed />
      <RecentlyViewed />
      <NewsletterSection />
      <FAQSection initialFAQ={faq} />
    </>
  );
}
