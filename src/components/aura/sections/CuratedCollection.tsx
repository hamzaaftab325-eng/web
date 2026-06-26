"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { collections } from "@/data/collections";
import { productBySlug } from "@/data/products";
import { useUIStore } from "@/store/use-ui-store";
import { SplitTextReveal } from "@/components/aura/animation/SplitTextReveal";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { formatPrice } from "@/lib/utils";

export function CuratedCollection() {
  const setCollection = useUIStore((s) => s.setCollection);
  const prefersReducedMotion = useReducedMotion();
  const collection = collections[0]; // Warm Tones

  const products = collection.productSlugs
    .slice(0, 3)
    .map((s) => productBySlug(s))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <section className="section-stack bg-canvas relative overflow-hidden">
      <div className="container-aura">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <p className="t-label-caps c-gold mb-4">Featured Collection</p>
            <SplitTextReveal
              as="h2"
              text={collection.name}
              splitBy="line"
              stagger={0.1}
              duration={0.9}
              className="t-display-md c-ink leading-[1.05] mb-6"
            />
            <TextBlurReveal
              as="p"
              duration={1}
              delay={0.3}
              className="t-body-lg c-ink-muted leading-relaxed mb-8 max-w-md"
            >
              {collection.description}
            </TextBlurReveal>

            <div className="space-y-3 mb-10 max-w-md">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-15% 0px" }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline justify-between gap-4 py-3 border-b border-hairline"
                >
                  <div>
                    <p className="t-body c-ink font-medium">{p.name}</p>
                    <p className="t-caption c-ink-faint">{p.subtitle}</p>
                  </div>
                  <span className="t-body-sm c-ink t-num">
                    {formatPrice(p.price)}
                  </span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setCollection(collection.slug)}
              className="group inline-flex items-center gap-3 bg-ink c-paper t-label-caps px-8 py-4 hover:bg-gold transition-colors"
            >
              Explore the Collection
              <ArrowRight
                size={14}
                strokeWidth={1.5}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* Image collage */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative h-[420px] md:h-[560px] lg:h-[640px]">
            {products.map((p, i) => {
              const positions = [
                "left-0 top-0 w-[55%] h-[70%]",
                "right-0 top-[8%] w-[42%] h-[55%]",
                "left-[15%] bottom-0 w-[45%] h-[40%]",
              ];
              return (
                <motion.button
                  key={p.id}
                  onClick={() => useUIStore.getState().openProduct(p.slug)}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={prefersReducedMotion ? undefined : { y: -8 }}
                  className={`absolute ${positions[i]} overflow-hidden bg-cream group`}
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CuratedCollection;
