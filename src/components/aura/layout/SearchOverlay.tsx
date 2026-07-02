"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { useProductSearch } from "@/hooks/queries/use-products";
import { search as trackSearch } from "@/lib/analytics/ecommerce";
import { formatPrice } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export function SearchOverlay() {
  const router = useRouter();
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);

  const [query, setQuery] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  useFocusTrap(overlayRef, open);
  const prefersReducedMotion = useReducedMotion();

  // Stagger variants — same gold-standard pattern as MobileNav
  const listStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
  };
  const listItem = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

  // Reset query when overlay closes — using the documented "store information
  // from previous render" pattern to avoid setState-in-effect warnings.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setQuery("");
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const { data: results = [] } = useProductSearch(query);

  // Fire search analytics event (debounced 800ms)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (query.trim().length >= 2) {
      searchTimer.current = setTimeout(() => {
        trackSearch({ search_term: query.trim() });
      }, 800);
    }
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query]);

  const popular = ["ceramic lamp", "fiddle leaf", "mirror", "terracotta", "candle"];

  const close = () => setOpen(false);

  const openP = (slug: string) => {
    close();
    router.push(`/product/${slug}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1200] overlay-dark"
          onClick={close}
        >
          <motion.div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            initial={prefersReducedMotion ? { opacity: 0 } : { y: -30, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: -30, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-paper w-full max-w-3xl mx-auto mt-20 md:mt-32"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 px-6 md:px-8 py-5 border-b border-hairline">
              <Search size={20} strokeWidth={1.25} className="c-ink" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lamps, mirrors, plants, materials…"
                className="flex-1 bg-transparent t-body-lg c-ink placeholder:c-ink-faint outline-none"
                aria-label="Search Aura Living"
              />
              <button
                onClick={close}
                aria-label="Close search"
                className="p-1 c-ink hover:c-gold transition-colors"
              >
                <X size={20} strokeWidth={1.25} />
              </button>
            </div>

            <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {!query.trim() && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={listStagger}
                >
                  <p className="t-label-caps c-ink-faint mb-3">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {popular.map((term) => (
                      <motion.button
                        key={term}
                        variants={listItem}
                        onClick={() => setQuery(term)}
                        className="chip"
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {query.trim() && results.length === 0 && (
                <div className="text-center py-12">
                  <p className="t-headline-sm c-ink-muted mb-2">No matches.</p>
                  <p className="t-body c-ink-faint">
                    Try a different word, or browse the full{" "}
                    <button
                      onClick={() => {
                        close();
                        router.push("/shop");
                      }}
                      className="link-underline c-gold"
                    >
                      shop
                    </button>
                    .
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <div>
                  <p className="t-label-caps c-ink-faint mb-4">
                    {results.length} {results.length === 1 ? "result" : "results"}
                  </p>
                  <motion.ul
                    key={query}  // re-stagger when query changes
                    initial="hidden"
                    animate="visible"
                    variants={listStagger}
                    className="space-y-2"
                  >
                    {results.map((p) => (
                      <motion.li key={p.id} variants={listItem}>
                        <button
                          onClick={() => openP(p.slug)}
                          className="flex items-center gap-4 w-full text-left p-2 hover:bg-cream transition-colors"
                        >
                          <div className="w-14 h-16 bg-cream overflow-hidden flex-shrink-0">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="t-body c-ink font-medium truncate">
                              {p.name}
                            </p>
                            <p className="t-caption c-ink-faint">{p.subtitle}</p>
                          </div>
                          <span className="t-body c-ink t-num font-medium">
                            {formatPrice(p.price)}
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SearchOverlay;
