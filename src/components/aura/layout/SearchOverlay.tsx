"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";

export function SearchOverlay() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const openProduct = useUIStore((s) => s.openProduct);
  const setView = useUIStore((s) => s.setView);

  const [query, setQuery] = useState("");

  // Reset query when overlay closes — track previous open state in a ref so
  // we only reset on actual transition, not on every render.
  const prevOpenRef = useRef(true);
  if (open !== prevOpenRef.current) {
    prevOpenRef.current = open;
    if (!open) setQuery("");
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          p.subtitle?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query]);

  const popular = ["ceramic lamp", "fiddle leaf", "mirror", "terracotta", "candle"];

  const close = () => setOpen(false);

  const openP = (slug: string) => {
    close();
    setTimeout(() => openProduct(slug), 100);
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
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
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
                <div>
                  <p className="t-label-caps c-ink-faint mb-3">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {popular.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="chip"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() && results.length === 0 && (
                <div className="text-center py-12">
                  <p className="t-headline-sm c-ink-muted mb-2">No matches.</p>
                  <p className="t-body c-ink-faint">
                    Try a different word, or browse the full{" "}
                    <button
                      onClick={() => {
                        close();
                        setView("shop");
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
                  <ul className="space-y-2">
                    {results.map((p) => (
                      <li key={p.id}>
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
                      </li>
                    ))}
                  </ul>
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
