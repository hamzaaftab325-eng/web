"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { products, productBySlug } from "@/data/products";
import { ProductCard } from "@/components/aura/commerce/ProductCard";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

/**
 * RecommendedForYou — homepage row showing recommended products based
 * on recently viewed categories. Falls back to featured products when
 * no browsing history exists.
 *
 * Recommendation logic (mock, swap to real API later):
 * 1. Read recently viewed slugs from localStorage (via useRecentlyViewed)
 * 2. Collect the categories of those products
 * 3. Find products in those categories, excluding already-viewed ones
 * 4. Sort by featured first, then by name
 * 5. If no recently viewed (first visit), show featured products
 *
 * Renders a horizontal scroll row on mobile, grid on desktop.
 */

const MAX_RECOMMENDATIONS = 8;

export function RecommendedForYou() {
  const { slugs } = useRecentlyViewed();

  const recommendations = useMemo(() => {
    // If no recently viewed, show featured products
    if (slugs.length === 0) {
      return products
        .filter((p) => p.featured)
        .slice(0, MAX_RECOMMENDATIONS);
    }

    // Collect categories from recently viewed products
    const recentProducts = slugs
      .map((slug) => productBySlug(slug))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const recentCategories = new Set(recentProducts.map((p) => p.category));
    const recentSlugs = new Set(slugs);

    // Find products in the same categories, excluding already viewed
    const recommended = products
      .filter((p) => !recentSlugs.has(p.slug))
      .filter((p) => recentCategories.has(p.category))
      .sort((a, b) => {
        // Featured first, then by name
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, MAX_RECOMMENDATIONS);

    // If not enough recommendations from categories, fill with featured
    if (recommended.length < 4) {
      const featured = products
        .filter((p) => p.featured && !recentSlugs.has(p.slug))
        .filter((p) => !recommended.find((r) => r.slug === p.slug))
        .slice(0, MAX_RECOMMENDATIONS - recommended.length);
      return [...recommended, ...featured];
    }

    return recommended;
  }, [slugs]);

  // Don't render if we don't have enough products to show
  if (recommendations.length < 2) return null;

  const hasHistory = slugs.length > 0;

  return (
    <section className="section-stack bg-cream/40">
      <div className="container-aura">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-8 md:mb-10">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              {hasHistory ? "For You" : "Featured"}
            </p>
            <h2 className="t-display-md c-ink leading-tight">
              {hasHistory ? "Pieces you might like." : "Start here."}
            </h2>
          </div>
          <p className="t-caption c-ink-faint t-num hidden md:block">
            {recommendations.length} pieces
          </p>
        </div>

        {/* Product row */}
        <RevealOnScroll
          stagger={0.06}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4"
        >
          {recommendations.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
                },
              }}
              className="flex-shrink-0 w-[240px] md:w-auto"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </RevealOnScroll>

        {/* Hint for first-time visitors */}
        {!hasHistory && (
          <p className="t-caption c-ink-faint mt-6 flex items-center gap-1.5">
            <Sparkles size={12} strokeWidth={1.5} className="c-gold-deep" />
            Browse a few pieces and this row will personalize to your taste.
          </p>
        )}
      </div>
    </section>
  );
}

export default RecommendedForYou;
