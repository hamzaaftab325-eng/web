"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { categories } from "@/data/categories";
import { collections } from "@/data/collections";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const setView = useUIStore((s) => s.setView);
  const setCategory = useUIStore((s) => s.setCategory);
  const setCollection = useUIStore((s) => s.setCollection);
  const resetShop = useUIStore((s) => s.resetShop);

  const close = () => setOpen(false);

  const goView = (v: "home" | "shop" | "about" | "journal") => {
    if (v === "shop") resetShop();
    setView(v);
  };

  const goCategory = (slug: string) => {
    setCategory(slug as never);
  };

  const goCollection = (slug: string) => {
    setCollection(slug);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[150] overlay-dark lg:hidden"
            onClick={close}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[160] w-full max-w-[420px] bg-paper lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-hairline">
              <span className="t-headline-sm c-ink">Menu</span>
              <button
                onClick={close}
                aria-label="Close menu"
                className="p-2 text-ink hover:text-gold transition-colors"
              >
                <X size={22} strokeWidth={1.25} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-8">
              <motion.nav
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
                }}
                className="space-y-1"
              >
                {[
                  { label: "Home", action: () => goView("home") },
                  { label: "Shop All", action: () => goView("shop") },
                  { label: "About", action: () => goView("about") },
                  { label: "Journal", action: () => goView("journal") },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    onClick={() => {
                      item.action();
                      close();
                    }}
                    className="block w-full text-left t-display-md c-ink hover:c-gold transition-colors py-3 border-b border-hairline"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </motion.nav>

              <div className="mt-10">
                <p className="t-label-caps c-ink-faint mb-4">Categories</p>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => {
                        goCategory(c.slug);
                        close();
                      }}
                      className="block t-body-lg c-ink-muted hover:c-gold transition-colors py-1.5"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="t-label-caps c-ink-faint mb-4">Collections</p>
                <div className="space-y-1">
                  {collections.map((col) => (
                    <button
                      key={col.slug}
                      onClick={() => {
                        goCollection(col.slug);
                        close();
                      }}
                      className="block t-body-lg c-ink-muted hover:c-gold transition-colors py-1.5"
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 border-t border-hairline">
              <p className="t-caption c-ink-faint mb-2">Need help?</p>
              <p className="t-body c-ink-muted">
                concierge@auraliving.com
                <br />
                +1 (503) 555-0142
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileNav;
