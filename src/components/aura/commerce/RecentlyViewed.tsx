"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { useProductsBySlugs } from "@/hooks/queries/use-product-by-slug";
import { useRouter } from "next/navigation";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

interface RecentlyViewedProps {
  /** Pass the current product slug so we don't show it in its own row. */
  excludeSlug?: string;
  className?: string;
}

export function RecentlyViewed({ excludeSlug, className }: RecentlyViewedProps) {
  const prefersReducedMotion = useReducedMotion();
  const { slugs, clear, loaded } = useRecentlyViewed();
  const router = useRouter();

  const filteredSlugs = slugs.filter((s) => s !== excludeSlug);
  const { products: items, isLoading } = useProductsBySlugs(filteredSlugs);

  if (!loaded || items.length === 0) return null;

  return (
    <section className={cn("container-aura section-stack", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="block h-px w-12 bg-gold" />
          <TextBlurReveal as="h2" className="t-headline-md c-ink" trigger="mount">
            Recently viewed
          </TextBlurReveal>
        </div>
        <button
          onClick={clear}
          className="inline-flex items-center gap-2 t-body-sm c-ink-muted hover:c-gold-deep transition-colors link-underline"
        >
          <Trash2 size={13} strokeWidth={1.5} />
          Clear history
        </button>
      </div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Edge scroll buttons — desktop only */}
        <ScrollButton direction="left" targetId="rv-row" />
        <ScrollButton direction="right" targetId="rv-row" />

        <div
          id="rv-row"
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
        >
          <AnimatePresence>
            {items.map((product, i) => (
              <motion.button
                key={product.id}
                layout={!prefersReducedMotion}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                onClick={() => router.push(`/product/${product.slug}`)}
                className="group snap-start flex-shrink-0 w-[160px] sm:w-[180px] text-left"
                aria-label={`View ${product.name}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-cream rounded-sm">
                  {/* Gold ring on the thumbnail */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-hairline-gold rounded-sm transition-all group-hover:ring-2 group-hover:ring-gold"
                  />
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-700",
                      prefersReducedMotion ? "" : "group-hover:scale-[1.04]"
                    )}
                  />
                </div>
                <div className="pt-3">
                  <p className="t-caption c-ink-faint mb-0.5">{product.subtitle}</p>
                  <p className="t-body-sm c-ink font-medium truncate">{product.name}</p>
                  <p className="t-body-sm c-ink t-num mt-0.5">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

/** Small scroll-by-arrow buttons that appear on desktop. */
function ScrollButton({
  direction,
  targetId,
}: {
  direction: "left" | "right";
  targetId: string;
}) {
  const isLeft = direction === "left";
  return (
    <button
      onClick={() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollBy({ left: isLeft ? -300 : 300, behavior: "smooth" });
        }
      }}
      aria-label={isLeft ? "Scroll left" : "Scroll right"}
      className={cn(
        "hidden lg:flex absolute top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-paper shadow-elevated items-center justify-center c-ink hover:c-gold-deep transition-colors",
        isLeft ? "-left-4" : "-right-4"
      )}
    >
      {isLeft ? (
        <ChevronLeft size={16} strokeWidth={1.5} />
      ) : (
        <ChevronRight size={16} strokeWidth={1.5} />
      )}
    </button>
  );
}

export default RecentlyViewed;
