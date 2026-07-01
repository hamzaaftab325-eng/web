"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X,
  GitCompare,
  Trash2,
  ChevronUp,
  Package,
  Ruler,
  Layers,
} from "lucide-react";
import type { Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { useProductsBySlugs } from "@/hooks/queries/use-product-by-slug";
import { useUIStore } from "@/store/use-ui-store";
import { useFocusTrap } from "@/hooks/use-focus-trap";

const COMPARE_KEY = "aura-living-compare";
const COMPARE_MAX = 4;

/* ==========================================================================
   useCompare — shared compare list, persisted to sessionStorage.
   Backed by a tiny Zustand store so every caller sees the same state.
   ========================================================================== */

interface CompareState {
  slugs: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
}

const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) => {
          if (s.slugs.includes(slug)) {
            return { slugs: s.slugs.filter((x) => x !== slug) };
          }
          if (s.slugs.length >= COMPARE_MAX) return s;
          return { slugs: [...s.slugs, slug] };
        }),
      remove: (slug) =>
        set((s) => ({ slugs: s.slugs.filter((x) => x !== slug) })),
      clear: () => set({ slugs: [] }),
      has: (slug) => get().slugs.includes(slug),
    }),
    {
      name: COMPARE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : (undefined as never)
      ),
      partialize: (s) => ({ slugs: s.slugs }),
    }
  )
);

/**
 * useCompare — hook over the shared compare list.
 * Returns `{ slugs, toggle, remove, clear, has, max }`. Because `slugs` is a
 * reactive selector, components re-render on every change and `has()` always
 * reads the freshest state.
 */
export function useCompare() {
  const slugs = useCompareStore((s) => s.slugs);
  const toggle = useCompareStore((s) => s.toggle);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const has = useCompareStore((s) => s.has);
  return { slugs, toggle, remove, clear, has, max: COMPARE_MAX };
}

/* ==========================================================================
   Helpers
   ========================================================================== */

const formatCategory = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" & ");

/* ==========================================================================
   CompareTray — bottom bar (2+ items) + full-screen comparison table.
   ========================================================================== */

export function CompareTray() {
  const prefersReducedMotion = useReducedMotion();
  const { slugs, remove, clear } = useCompare();
  const openProductPage = useUIStore((s) => s.openProductPage);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, open);

  const { products: items } = useProductsBySlugs(slugs);

  const showTray = slugs.length >= 2;
  const atMax = slugs.length >= COMPARE_MAX;

  // Esc closes the full-screen table.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const viewProduct = (slug: string) => {
    setOpen(false);
    window.setTimeout(() => openProductPage(slug), 0);
  };

  return (
    <>
      {/* Bottom tray bar */}
      <AnimatePresence>
        {showTray && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[800] safe-area-bottom"
            initial={prefersReducedMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            role="region"
            aria-label="Compare tray"
          >
            <div className="container-aura pb-3">
              <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern shadow-elevated px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Label + count */}
                  <div className="flex items-center gap-2 shrink-0">
                    <GitCompare size={18} strokeWidth={1.25} className="c-ink" />
                    <div className="leading-tight">
                      <p className="t-label-caps c-ink">Compare</p>
                      <p className="t-caption c-ink-faint t-num">
                        {slugs.length}/{COMPARE_MAX}
                      </p>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0">
                    {items.map((p) => (
                      <div
                        key={p.id}
                        className="relative flex-shrink-0 group"
                      >
                        <button
                          type="button"
                          onClick={() => viewProduct(p.slug)}
                          className="block w-12 h-12 sm:w-14 sm:h-14 bg-cream overflow-hidden border border-hairline hover:border-hairline-gold transition-colors"
                          aria-label={`View ${p.name}`}
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p.slug)}
                          aria-label={`Remove ${p.name} from compare`}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink c-paper flex items-center justify-center hover:bg-gold-deep transition-colors"
                        >
                          <X size={11} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                    {atMax && (
                      <span className="t-caption c-ink-faint ml-1 shrink-0">
                        Max reached
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={clear}
                      className="hidden sm:inline-flex items-center gap-1.5 t-label-caps c-ink-muted hover:c-gold-deep transition-colors link-underline"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-5 h-10 rounded-sm hover:bg-gold-deep transition-colors"
                    >
                      Compare
                      <ChevronUp size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen comparison table */}
      <AnimatePresence>
        {open && showTray && (
          <motion.div
            className="fixed inset-0 z-[1000] flex flex-col bg-canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Product comparison"
          >
            {/* Scrim click area handled by the close button + Esc */}
            <motion.div
              ref={containerRef}
              className="flex-1 flex flex-col overflow-y-auto scrollbar-thin"
              initial={prefersReducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <header className="sticky top-0 z-10 glass-nav border-b border-hairline">
                <div className="container-aura flex items-center justify-between h-[64px]">
                  <div className="flex items-center gap-3">
                    <GitCompare size={18} strokeWidth={1.25} className="c-ink" />
                    <h2 className="t-headline-sm c-ink">Compare</h2>
                    <span className="t-caption c-ink-faint t-num">
                      {items.length} pieces
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={clear}
                      className="hidden sm:inline-flex items-center gap-1.5 t-label-caps c-ink-muted hover:c-gold-deep transition-colors link-underline"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                      Clear all
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close comparison"
                      className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
                    >
                      Close
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </header>

              {/* Table */}
              <div className="container-aura py-8 lg:py-10">
                <p className="t-caption c-ink-faint lg:hidden mb-3 text-center">← Swipe to compare →</p>
                <div className="overflow-x-auto scrollbar-thin -mx-4 px-4">
                  <table className="w-full border-collapse min-w-[680px]">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="w-40 p-4 text-left align-bottom t-label-caps c-ink-faint"
                        >
                          Product
                        </th>
                        {items.map((p) => (
                          <th
                            key={p.id}
                            scope="col"
                            className="p-4 text-left align-bottom min-w-[200px]"
                          >
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => remove(p.slug)}
                                aria-label={`Remove ${p.name}`}
                                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-paper border border-hairline c-ink flex items-center justify-center hover:c-gold-deep hover:border-hairline-gold transition-colors"
                              >
                                <X size={12} strokeWidth={1.75} />
                              </button>
                              <button
                                type="button"
                                onClick={() => viewProduct(p.slug)}
                                className="block w-full aspect-[4/5] bg-cream overflow-hidden border border-hairline hover:border-hairline-gold transition-colors mb-3"
                              >
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                              <p className="t-caption c-ink-faint mb-0.5">
                                {p.subtitle}
                              </p>
                              <h3 className="t-headline-sm c-ink leading-tight">
                                {p.name}
                              </h3>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <CompareRow
                        label="Price"
                        icon={<span className="t-label-caps">$</span>}
                      >
                        {items.map((p) => (
                          <td key={p.id} className="p-4 border-t border-hairline align-top">
                            <div className="flex items-baseline gap-2">
                              <span className="t-headline-sm c-ink t-num font-medium">
                                {formatPrice(p.price)}
                              </span>
                              {p.compareAtPrice &&
                                p.compareAtPrice > p.price && (
                                  <span className="t-caption c-ink-faint line-through t-num">
                                    {formatPrice(p.compareAtPrice)}
                                  </span>
                                )}
                            </div>
                          </td>
                        ))}
                      </CompareRow>

                      <CompareRow label="Category">
                        {items.map((p) => (
                          <td
                            key={p.id}
                            className="p-4 border-t border-hairline align-top"
                          >
                            <span className="t-body-sm c-ink-muted">
                              {formatCategory(p.category)}
                            </span>
                          </td>
                        ))}
                      </CompareRow>

                      <CompareRow label="Availability">
                        {items.map((p) => (
                          <td
                            key={p.id}
                            className="p-4 border-t border-hairline align-top"
                          >
                            <span className="inline-flex items-center gap-1.5 t-body-sm">
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  p.inStock ? "bg-success" : "bg-error"
                                )}
                                aria-hidden="true"
                              />
                              <span
                                className={cn(
                                  p.inStock ? "c-ink" : "c-error"
                                )}
                              >
                                {p.inStock ? "In stock" : "Sold out"}
                              </span>
                            </span>
                          </td>
                        ))}
                      </CompareRow>

                      <CompareRow label="Badge">
                        {items.map((p) => (
                          <td
                            key={p.id}
                            className="p-4 border-t border-hairline align-top"
                          >
                            {p.badge ? (
                              <span
                                className={cn(
                                  "inline-flex t-label-caps px-2.5 py-1.5",
                                  p.badge === "Sold Out" && "bg-ink c-paper",
                                  p.badge === "Sale" && "bg-gold c-paper",
                                  (p.badge === "New" ||
                                    p.badge === "Bestseller") &&
                                    "bg-paper c-ink border border-hairline"
                                )}
                              >
                                {p.badge}
                              </span>
                            ) : (
                              <span className="t-body-sm c-ink-faint">—</span>
                            )}
                          </td>
                        ))}
                      </CompareRow>

                      <CompareRow
                        label="Materials"
                        icon={<Layers size={13} strokeWidth={1.5} />}
                      >
                        {items.map((p) => (
                          <td
                            key={p.id}
                            className="p-4 border-t border-hairline align-top"
                          >
                            {p.materials && p.materials.length > 0 ? (
                              <ul className="space-y-1">
                                {p.materials.map((m) => (
                                  <li
                                    key={m}
                                    className="t-body-sm c-ink-muted flex items-start gap-1.5"
                                  >
                                    <span
                                      className="c-gold mt-1.5"
                                      aria-hidden="true"
                                    >
                                      ·
                                    </span>
                                    {m}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="t-body-sm c-ink-faint">—</span>
                            )}
                          </td>
                        ))}
                      </CompareRow>

                      <CompareRow
                        label="Dimensions"
                        icon={<Ruler size={13} strokeWidth={1.5} />}
                      >
                        {items.map((p) => (
                          <td
                            key={p.id}
                            className="p-4 border-t border-hairline align-top"
                          >
                            <span className="t-body-sm c-ink-muted leading-relaxed">
                              {p.dimensions || "Varies — see product page"}
                            </span>
                          </td>
                        ))}
                      </CompareRow>

                      {/* Footer action row */}
                      <CompareRow label="">
                        {items.map((p) => (
                          <td
                            key={p.id}
                            className="p-4 border-t border-hairline align-top"
                          >
                            <button
                              type="button"
                              onClick={() => viewProduct(p.slug)}
                              disabled={!p.inStock}
                              className={cn(
                                "w-full h-10 inline-flex items-center justify-center gap-2 t-label-caps rounded-sm transition-colors",
                                p.inStock
                                  ? "bg-ink c-paper hover:bg-gold-deep"
                                  : "bg-cream c-ink-faint cursor-not-allowed"
                              )}
                            >
                              <Package size={13} strokeWidth={1.5} />
                              {p.inStock ? "View & Buy" : "Sold Out"}
                            </button>
                          </td>
                        ))}
                      </CompareRow>
                    </tbody>
                  </table>
                </div>

                {/* Mobile clear */}
                <div className="flex sm:hidden justify-center mt-6">
                  <button
                    type="button"
                    onClick={clear}
                    className="inline-flex items-center gap-1.5 t-label-caps c-ink-muted hover:c-gold-deep transition-colors link-underline"
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                    Clear all
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface CompareRowProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function CompareRow({ label, icon, children }: CompareRowProps) {
  return (
    <tr>
      <th
        scope="row"
        className="w-40 p-4 text-left align-top border-t border-hairline"
      >
        <span className="inline-flex items-center gap-1.5 t-label-caps c-ink-faint">
          {icon}
          {label}
        </span>
      </th>
      {children}
    </tr>
  );
}

export default CompareTray;
