"use client";

import { ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { useUIStore } from "@/store/use-ui-store";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { ProductCard } from "@/components/aura/commerce/ProductCard";

export function FeaturedProducts() {
  const setView = useUIStore((s) => s.setView);

  // Show 8 featured / curated pieces
  const featured = products
    .filter((p) => p.featured)
    .slice(0, 4)
    .concat(products.filter((p) => !p.featured).slice(0, 4));

  return (
    <section className="section-stack bg-cream">
      <div className="container-aura">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p className="t-label-caps c-gold mb-3">Curated for you</p>
            <TextBlurReveal
              as="h2"
              className="t-display-md c-ink leading-tight max-w-xl"
            >
              Quietly considered, made to live with.
            </TextBlurReveal>
          </div>
          <button
            onClick={() => setView("shop")}
            className="group inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold transition-colors link-underline w-fit"
          >
            View All Products
            <ArrowRight
              size={14}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
