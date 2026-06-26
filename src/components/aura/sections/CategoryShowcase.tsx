"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { useUIStore } from "@/store/use-ui-store";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

export function CategoryShowcase() {
  const setCategory = useUIStore((s) => s.setCategory);

  const cards = categories.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.category === c.slug).length,
  }));

  return (
    <section className="section-stack bg-canvas">
      <div className="container-aura">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p className="t-label-caps c-gold mb-3">Categories</p>
            <TextBlurReveal
              as="h2"
              className="t-display-md c-ink leading-tight max-w-xl"
            >
              Shop by category
            </TextBlurReveal>
          </div>
          <p className="t-body c-ink-muted max-w-sm">
            Six considered categories, sourced from small workshops. No
            furniture, no kitchen — only the quiet pieces that finish a room.
          </p>
        </div>

        <RevealOnScroll stagger={0.08} className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 md:gap-y-16">
          {cards.map((cat, i) => (
            <motion.button
              key={cat.slug}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                },
              }}
              onClick={() => setCategory(cat.slug)}
              className={`group text-left ${i % 5 === 0 || i % 5 === 3 ? "md:row-span-1" : ""}`}
            >
              <div className="aspect-[4/5] overflow-hidden bg-cream mb-5 relative">
                <img
                  src={cat.heroImage}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="t-headline-md c-ink group-hover:c-gold transition-colors">
                  {cat.name}
                </h3>
                <ArrowUpRight
                  size={18}
                  strokeWidth={1.25}
                  className="c-ink-faint group-hover:c-gold transition-colors flex-shrink-0"
                />
              </div>
              <p className="t-caption c-ink-faint mt-2 t-num">
                {cat.productCount} pieces
              </p>
            </motion.button>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}

export default CategoryShowcase;
