"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { categories } from "@/data/categories";
import { allMaterials } from "@/data/products";
import { cn, formatPrice } from "@/lib/utils";

const PRICE_BANDS = [
  { id: "under-50", label: "Under $50", min: 0, max: 50 },
  { id: "50-150", label: "$50 – $150", min: 50, max: 150 },
  { id: "150-300", label: "$150 – $300", min: 150, max: 300 },
  { id: "over-300", label: "Over $300", min: 300, max: Infinity },
];

export function FilterSidebar() {
  const {
    activeCategory,
    setCategory,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    mobileNavOpen,
    setMobileNavOpen,
  } = useUIStore();
  const prefersReducedMotion = useReducedMotion();

  const allMats = allMaterials();

  const isFilterActive = (field: string, value: string) =>
    filters.some((f) => f.field === field && f.value === value);

  const toggleFilter = (field: "category" | "material" | "price", value: string, label: string) => {
    const existing = { field, value, label };
    if (isFilterActive(field, value)) {
      removeFilter(existing);
    } else {
      addFilter(existing);
    }
  };

  const clearAll = () => clearFilters();

  const closeMobile = () => setMobileNavOpen(false);

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-[260px] flex-shrink-0">
        <FilterContent
          activeCategory={activeCategory}
          setCategory={setCategory}
          filters={filters}
          isFilterActive={isFilterActive}
          toggleFilter={toggleFilter}
          clearAll={clearAll}
          allMats={allMats}
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMobile}
              className="fixed inset-0 z-[1000] overlay-dark lg:hidden"
            />
            <motion.aside
              initial={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 bottom-0 z-[1100] w-full max-w-[360px] bg-paper flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-6 h-[72px] border-b border-hairline">
                <span className="t-headline-sm c-ink">Filter & Sort</span>
                <button
                  onClick={closeMobile}
                  aria-label="Close filters"
                  className="p-2 text-ink hover:text-gold transition-colors"
                >
                  <X size={22} strokeWidth={1.25} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <FilterContent
                  activeCategory={activeCategory}
                  setCategory={setCategory}
                  filters={filters}
                  isFilterActive={isFilterActive}
                  toggleFilter={toggleFilter}
                  clearAll={clearAll}
                  allMats={allMats}
                />
              </div>

              <div className="border-t border-hairline px-6 py-4">
                <button
                  onClick={closeMobile}
                  className="w-full bg-ink c-paper t-label-caps py-3.5 hover:bg-gold transition-colors"
                >
                  Show Results
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface FilterContentProps {
  activeCategory: string;
  setCategory: (c: any) => void;
  filters: any[];
  isFilterActive: (field: string, value: string) => boolean;
  toggleFilter: (field: "category" | "material" | "price", value: string, label: string) => void;
  clearAll: () => void;
  allMats: string[];
}

function FilterContent({
  activeCategory,
  setCategory,
  filters,
  isFilterActive,
  toggleFilter,
  clearAll,
  allMats,
}: FilterContentProps) {
  const hasActive =
    activeCategory !== "all" || filters.length > 0;

  return (
    <div className="p-6 lg:p-0">
      <div className="flex items-center justify-between mb-6">
        <p className="t-label-caps c-ink">Filter</p>
        {hasActive && (
          <button
            onClick={clearAll}
            className="t-caption c-ink-faint hover:c-gold transition-colors link-underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <section className="mb-8">
        <p className="t-label-caps c-ink-faint mb-3">Category</p>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setCategory("all")}
              className={cn(
                "block w-full text-left t-body py-1.5 transition-colors",
                activeCategory === "all" ? "c-gold" : "c-ink-muted hover:c-ink"
              )}
            >
              All Products
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "block w-full text-left t-body py-1.5 transition-colors",
                  activeCategory === c.slug ? "c-gold" : "c-ink-muted hover:c-ink"
                )}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Price */}
      <section className="mb-8">
        <p className="t-label-caps c-ink-faint mb-3">Price</p>
        <ul className="space-y-2">
          {PRICE_BANDS.map((band) => (
            <li key={band.id}>
              <button
                onClick={() => toggleFilter("price", band.id, band.label)}
                className="flex items-center gap-3 w-full text-left t-body c-ink-muted hover:c-ink transition-colors"
              >
                <span
                  className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-colors",
                    isFilterActive("price", band.id)
                      ? "bg-ink border-ink"
                      : "border-hairline-strong"
                  )}
                >
                  {isFilterActive("price", band.id) && (
                    <Check size={11} strokeWidth={2.5} className="c-paper" />
                  )}
                </span>
                {band.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Material */}
      <section>
        <p className="t-label-caps c-ink-faint mb-3">Material</p>
        <ul className="space-y-2">
          {allMats.slice(0, 12).map((mat) => (
            <li key={mat}>
              <button
                onClick={() => toggleFilter("material", mat, mat)}
                className="flex items-center gap-3 w-full text-left t-body c-ink-muted hover:c-ink transition-colors"
              >
                <span
                  className={cn(
                    "w-4 h-4 border flex items-center justify-center transition-colors",
                    isFilterActive("material", mat)
                      ? "bg-ink border-ink"
                      : "border-hairline-strong"
                  )}
                >
                  {isFilterActive("material", mat) && (
                    <Check size={11} strokeWidth={2.5} className="c-paper" />
                  )}
                </span>
                {mat}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default FilterSidebar;
