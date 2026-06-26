"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import { categories, categoryBySlug } from "@/data/categories";
import { collections, collectionBySlug } from "@/data/collections";
import { useUIStore, type SortKey } from "@/store/use-ui-store";
import { ProductGrid } from "@/components/aura/commerce/ProductGrid";
import { FilterSidebar } from "@/components/aura/commerce/FilterSidebar";
import { SplitTextReveal } from "@/components/aura/animation/SplitTextReveal";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { cn, formatPrice } from "@/lib/utils";

const PRICE_BANDS: Record<string, { min: number; max: number }> = {
  "under-50": { min: 0, max: 50 },
  "50-150": { min: 50, max: 150 },
  "150-300": { min: 150, max: 300 },
  "over-300": { min: 300, max: Infinity },
};

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "best-selling", label: "Best Selling" },
];

export function ShopView() {
  const {
    activeCategory,
    activeCollection,
    filters,
    sort,
    setSort,
    setMobileNavOpen,
    removeFilter,
    clearFilters,
  } = useUIStore();

  const [visibleCount, setVisibleCount] = useState(12);
  const [sortOpen, setSortOpen] = useState(false);

  const collection = activeCollection ? collectionBySlug(activeCollection) : null;
  const category = activeCategory !== "all" ? categoryBySlug(activeCategory) : null;

  // Compute filtered + sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (collection) {
      result = result.filter((p) =>
        collection.productSlugs.includes(p.slug)
      );
    } else if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Apply filter tags
    const materialFilters = filters
      .filter((f) => f.field === "material")
      .map((f) => f.value);
    const priceFilters = filters
      .filter((f) => f.field === "price")
      .map((f) => f.value);

    if (materialFilters.length > 0) {
      result = result.filter((p) =>
        p.materials?.some((m) => materialFilters.includes(m))
      );
    }

    if (priceFilters.length > 0) {
      result = result.filter((p) =>
        priceFilters.some((bandId) => {
          const band = PRICE_BANDS[bandId];
          return p.price >= band.min && p.price < band.max;
        })
      );
    }

    // Sort
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0)
        );
        break;
      case "best-selling":
        result.sort(
          (a, b) =>
            (b.badge === "Bestseller" ? 1 : 0) -
            (a.badge === "Bestseller" ? 1 : 0)
        );
        break;
      case "featured":
      default:
        result.sort(
          (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        );
    }

    return result;
  }, [activeCategory, activeCollection, filters, sort, collection]);

  const visible = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Reset pagination when filters change — using the documented "store
  // information from previous render" pattern to avoid setState-in-effect.
  const filterSignature = `${activeCategory}|${activeCollection}|${filters.length}|${sort}`;
  const [prevSig, setPrevSig] = useState(filterSignature);
  if (filterSignature !== prevSig) {
    setPrevSig(filterSignature);
    setVisibleCount(12);
  }

  const heading = collection
    ? collection.name
    : category
    ? category.name
    : "All Products";

  const subheading = collection
    ? collection.description
    : category
    ? category.description
    : "Considered pieces, sourced from small workshops we know by name.";

  return (
    <div className="bg-canvas pt-[88px] md:pt-[120px]">
      {/* Hero strip */}
      <section className="bg-cream py-12 md:py-16">
        <div className="container-aura">
          <nav className="t-caption c-ink-faint mb-6 flex items-center gap-2">
            <button
              onClick={() => useUIStore.getState().setView("home")}
              className="hover:c-gold transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="c-ink-muted">Shop</span>
            {category && (
              <>
                <span>/</span>
                <span className="c-ink">{category.name}</span>
              </>
            )}
            {collection && (
              <>
                <span>/</span>
                <span className="c-ink">{collection.name}</span>
              </>
            )}
          </nav>

          <SplitTextReveal
            as="h1"
            text={heading}
            splitBy="line"
            stagger={0.08}
            duration={0.9}
            className="t-display-lg c-ink leading-[1.05] mb-4 max-w-3xl"
          />
          <TextBlurReveal
            as="p"
            delay={0.3}
            className="t-body-lg c-ink-muted max-w-xl"
          >
            {subheading}
          </TextBlurReveal>
        </div>
      </section>

      {/* Toolbar + grid */}
      <section className="py-10 md:py-16">
        <div className="container-aura">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* Filter sidebar (desktop persistent) */}
            <FilterSidebar />

            {/* Mobile filter trigger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 t-label-caps c-ink border border-hairline px-4 py-3 self-start"
            >
              <SlidersHorizontal size={14} strokeWidth={1.5} />
              Filter & Sort
            </button>

            {/* Main grid */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6 md:mb-8 pb-4 border-b border-hairline">
                <p className="t-body c-ink-muted">
                  <span className="c-ink t-num font-medium">{filteredProducts.length}</span>{" "}
                  {filteredProducts.length === 1 ? "piece" : "pieces"}
                </p>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen((o) => !o)}
                    aria-expanded={sortOpen}
                    className="inline-flex items-center gap-2 t-body c-ink hover:c-gold transition-colors"
                  >
                    Sort:{" "}
                    <span className="c-ink-muted">
                      {sortOptions.find((o) => o.key === sort)?.label}
                    </span>
                    <ChevronDown
                      size={14}
                      strokeWidth={1.25}
                      className={cn("transition-transform", sortOpen && "rotate-180")}
                    />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setSortOpen(false)}
                        />
                        <motion.ul
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 z-20 bg-paper border border-hairline shadow-ambient min-w-[200px] py-1"
                        >
                          {sortOptions.map((o) => (
                            <li key={o.key}>
                              <button
                                onClick={() => {
                                  setSort(o.key);
                                  setSortOpen(false);
                                }}
                                className={cn(
                                  "block w-full text-left t-body px-4 py-2 hover:bg-cream transition-colors",
                                  sort === o.key ? "c-gold" : "c-ink-muted"
                                )}
                              >
                                {o.label}
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Active filters */}
              {filters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {filters.map((f) => (
                    <button
                      key={`${f.field}-${f.value}`}
                      onClick={() =>
                        removeFilter({ field: f.field, value: f.value, label: f.label })
                      }
                      className="inline-flex items-center gap-1.5 chip"
                      data-active="true"
                    >
                      {f.label}
                      <X size={12} strokeWidth={2} />
                    </button>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="t-caption c-ink-faint hover:c-gold transition-colors link-underline ml-2"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Grid */}
              <ProductGrid products={visible} priorityCount={4} />

              {/* Load more */}
              {hasMore && (
                <div className="text-center mt-16">
                  <button
                    onClick={() => setVisibleCount((c) => c + 8)}
                    className="group inline-flex items-center gap-2 border border-ink t-label-caps c-ink px-8 py-3.5 hover:bg-ink hover:c-paper transition-colors"
                  >
                    Load More
                    <span className="c-ink-faint group-hover:c-paper/60 t-num">
                      ({filteredProducts.length - visibleCount} more)
                    </span>
                    <ArrowRight
                      size={14}
                      strokeWidth={1.5}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ShopView;
