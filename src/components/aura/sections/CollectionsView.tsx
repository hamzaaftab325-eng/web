"use client";

import { ArrowRight } from "lucide-react";

import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { PageHero } from "@/components/aura/layout/PageHero";
import { useCollections } from "@/hooks/queries/use-catalog";
import { useProducts } from "@/hooks/queries/use-products";
import { formatPrice, cn } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";

/**
 * CollectionsView — index of the three curated Aura Living
 * collections, presented as large split-layout cards (image left,
 * info right). Clicking "Explore" hands the shopper to the shop
 * view with the collection pre-set via `setCollection`.
 */
interface CollectionsViewProps {
  initialCollections?: Awaited<ReturnType<typeof import("@/lib/services/collection.service").getAll>>;
}

export function CollectionsView({ initialCollections }: CollectionsViewProps = {}) {
  const { data: collections = initialCollections ?? [], isLoading: collectionsLoading } = useCollections();
  const { data: productData } = useProducts();
  const products = productData?.products ?? [];
  const setCollection = useUIStore((s) => s.setCollection);

  return (
    <div className="bg-gradient-to-b from-canvas to-cream/20 min-h-screen">
      {/* Page hero — full-bleed image under fixed header */}
      <PageHero
        image="/hero/collections.webp"
        alt="Three curated room vignettes side by side, each styled around a different palette."
        eyebrow="Collections"
        headline="Curated Edits"
      />

      {/* Loading state */}
      {collectionsLoading && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="aura-loader-ring aura-loader-lg" />
          <p className="mt-6 t-label-caps c-ink-faint">Loading collections…</p>
        </div>
      )}

      {/* Empty state */}
      {!collectionsLoading && collections.length === 0 && (
        <div className="container-aura py-24 text-center">
          <p className="t-headline-sm c-ink mb-3">No collections yet</p>
          <p className="t-body c-ink-muted">Collections will appear here once they're created in the admin panel.</p>
        </div>
      )}

      {/* Collection cards — only show when loaded and non-empty */}
      {!collectionsLoading && collections.length > 0 && (
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <div className="space-y-10 md:space-y-16">
            {collections.map((collection, i) => {
              const reversed = i % 2 === 1;
              const previewProducts = collection.productSlugs
                .slice(0, 4)
                .map((slug) => products.find((p) => p.slug === slug))
                .filter((p): p is NonNullable<typeof p> => Boolean(p));
              const fromPrice = Math.min(
                ...collection.productSlugs
                  .map((slug) => products.find((p) => p.slug === slug)?.price ?? Infinity)
              );

              return (
                <RevealOnScroll
                  key={collection.slug}
                  direction="up"
                  duration={0.8}
                >
                  <article
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern overflow-hidden"
                  >
                    {/* Image */}
                    <div
                      className={cn(
                        "lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden bg-cream-deep",
                        reversed ? "lg:order-2" : "lg:order-1"
                      )}
                    >
                      <img
                        src={collection.heroImage ?? undefined}
                        alt={collection.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1.4s] hover:scale-[1.03]"
                      />
                    </div>

                    {/* Info */}
                    <div
                      className={cn(
                        "lg:col-span-5 p-6 md:p-10 lg:p-12 flex flex-col justify-between",
                        reversed ? "lg:order-1" : "lg:order-2"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="t-label-caps c-gold-deep">
                            Edit · {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="w-8 h-px bg-gold/40" aria-hidden />
                        </div>
                        <h2 className="t-display-md c-ink leading-tight mb-4">
                          {collection.name}
                        </h2>
                        <p className="t-body-lg c-ink-muted leading-relaxed mb-8">
                          {collection.description}
                        </p>

                        {/* Preview thumbnails */}
                        <div className="grid grid-cols-4 gap-2 mb-8">
                          {previewProducts.map((p) => (
                            <div
                              key={p.id}
                              className="aspect-square overflow-hidden bg-cream-deep rounded-sm"
                            >
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-baseline justify-between gap-4 py-3 border-t border-hairline-cream mb-6">
                          <span className="t-label-caps c-ink-faint">
                            {collection.productSlugs.length} pieces
                          </span>
                          <span className="t-body-sm c-ink-muted">
                            From{" "}
                            <span className="t-body c-ink t-num font-medium">
                              {formatPrice(fromPrice)}
                            </span>
                          </span>
                        </div>

                        {/* Explore link — gold-deep on hover */}
                        <button
                          onClick={() => setCollection(collection.slug)}
                          className="group inline-flex items-center gap-3 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
                        >
                          Explore {collection.name}
                          <ArrowRight
                            size={14}
                            strokeWidth={1.5}
                            className="transition-transform group-hover:translate-x-1 c-gold-deep"
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>
      )}
    </div>
  );
}

export default CollectionsView;
