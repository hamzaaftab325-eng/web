"use client";

import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { X, Check } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { LEFT_DRAWER_CONSTRAINTS, leftDrawerDragEnd } from "@/lib/swipe-to-close";
import { useCategories } from "@/hooks/queries/use-catalog";
import { useAllMaterials } from "@/hooks/queries/use-products";
import { cn } from "@/lib/utils";
import type { ActiveFilter, CategorySlug } from "@/types";

const PRICE_BANDS = [
  { id: "under-5000", label: "Under ₨5,000", min: 0, max: 5000 },
  { id: "5000-15000", label: "₨5,000 – ₨15,000", min: 5000, max: 15000 },
  { id: "15000-30000", label: "₨15,000 – ₨30,000", min: 15000, max: 30000 },
  { id: "over-30000", label: "Over ₨30,000", min: 30000, max: Infinity },
];

export function FilterSidebar() {
  const {
    activeCategory,
    setCategory,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    filterDrawerOpen,
    setFilterDrawerOpen,
  } = useUIStore();
  const prefersReducedMotion = useReducedMotion();

  const { data: categories = [] } = useCategories();
  const { data: allMats = [] } = useAllMaterials();

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

  const closeMobile = () => setFilterDrawerOpen(false);

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-[260px] flex-shrink-0">
        <FilterContent
          categories={categories}
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
        {filterDrawerOpen && (
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
              drag={prefersReducedMotion ? false : "x"}
              dragConstraints={LEFT_DRAWER_CONSTRAINTS}
              dragElastic={0.2}
              onDragEnd={(_e: unknown, info: PanInfo) => leftDrawerDragEnd(info, closeMobile)}
              className="fixed top-0 left-0 bottom-0 z-[1100] w-full max-w-[360px] bg-paper flex flex-col lg:hidden"
            >
              {/* Drag handle (right edge) */}
              {!prefersReducedMotion && (
                <div className="absolute top-0 right-0 bottom-0 w-1 flex items-center justify-center cursor-ew-resize" aria-hidden>
                  <div className="w-[3px] h-12 rounded-full bg-hairline-gold opacity-40" />
                </div>
              )}
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
          categories={categories}
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
  categories: { slug: string; name: string }[];
  activeCategory: string;
  setCategory: (c: "all" | CategorySlug) => void;
  filters: ActiveFilter[];
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
  categories,
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
                onClick={() => setCategory(c.slug as never)}
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
