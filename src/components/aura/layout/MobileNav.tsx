"use client";

import { useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { X, Mail, Phone, ChevronRight } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { cn } from "@/lib/utils";
import { RIGHT_DRAWER_CONSTRAINTS, rightDrawerDragEnd } from "@/lib/swipe-to-close";
import { useCategories, useCollections } from "@/hooks/queries/use-catalog";
import { ThemeToggle } from "@/components/aura/ui/ThemeToggle";
import { DisplayPreferences } from "@/components/aura/ui/DisplayPreferences";
import { useFocusTrap } from "@/hooks/use-focus-trap";

type MainItem = {
  label: string;
  action: () => void;
  match: (pathname: string) => boolean;
};

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const setCategory = useUIStore((s) => s.setCategory);
  const setCollection = useUIStore((s) => s.setCollection);
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, open);
  const resetShop = useUIStore((s) => s.resetShop);
  const prefersReducedMotion = useReducedMotion();

  const close = () => setOpen(false);

  const goView = (path: string) => {
    if (path === "/shop") resetShop();
    router.push(path);
    close();
  };

  const goCategory = (slug: string) => {
    setCategory(slug as never);
    router.push("/shop");
    close();
  };

  const goCollection = (slug: string) => {
    setCollection(slug);
    router.push("/shop");
    close();
  };

  const mainItems: MainItem[] = [
    { label: "Home", action: () => goView("/"), match: (p) => p === "/" },
    { label: "Shop All", action: () => goView("/shop"), match: (p) => p.startsWith("/shop") },
    { label: "Collections", action: () => goView("/collections"), match: (p) => p.startsWith("/collections") },
    { label: "About", action: () => goView("/about"), match: (p) => p.startsWith("/about") },
    { label: "Journal", action: () => goView("/journal"), match: (p) => p.startsWith("/journal") },
    { label: "Care Guides", action: () => goView("/care"), match: (p) => p.startsWith("/care") },
  ];

  const subStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
  };
  const subItem = {
    hidden: { opacity: 0, x: 12 },
    visible: { opacity: 1, x: 0 },
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
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            drag={prefersReducedMotion ? false : "x"}
            dragConstraints={RIGHT_DRAWER_CONSTRAINTS}
            dragElastic={0.2}
            onDragEnd={(_e: unknown, info: PanInfo) => rightDrawerDragEnd(info, close)}
            className="fixed top-0 right-0 bottom-0 z-[160] w-full max-w-[420px] bg-paper lg:hidden flex flex-col shadow-elevated"
          >
            {/* Drag handle (left edge) — wider hit area, subtle gold pill */}
            {!prefersReducedMotion && (
              <div className="absolute top-0 left-0 bottom-0 w-3 flex items-center justify-center cursor-ew-resize" aria-hidden>
                <div className="w-[3px] h-14 rounded-full bg-gold/30" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-hairline">
              <div className="flex items-baseline gap-3">
                <span className="t-headline-sm c-ink">Menu</span>
                <span className="t-label-caps c-ink-faint">Aura Living</span>
              </div>
              <button
                onClick={close}
                aria-label="Close menu"
                className="p-2 -mr-2 text-ink hover:text-gold transition-colors rounded-full hover:bg-canvas/60"
              >
                <X size={22} strokeWidth={1.25} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-7">
              {/* Primary nav */}
              <motion.nav
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
                }}
                className="space-y-0"
              >
                {mainItems.map((item) => {
                  const isActive = item.match(pathname);
                  return (
                    <motion.button
                      key={item.label}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      onClick={item.action}
                      className="group relative flex items-center justify-between w-full text-left py-3.5 border-b border-hairline"
                    >
                      {/* Active indicator — gold left bar */}
                      <span
                        className={cn(
                          "absolute -left-3 top-1/2 -translate-y-1/2 w-[2px] rounded-full bg-gold transition-all duration-300",
                          isActive ? "h-6 opacity-100" : "h-0 opacity-0"
                        )}
                      />
                      <span
                        className={cn(
                          "t-display-md transition-colors",
                          isActive ? "c-gold" : "c-ink group-hover:c-gold"
                        )}
                      >
                        {item.label}
                      </span>
                      <ChevronRight
                        size={16}
                        strokeWidth={1.5}
                        className={cn(
                          "transition-all duration-300",
                          isActive ? "c-gold opacity-100 translate-x-0" : "c-ink-faint opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0"
                        )}
                      />
                    </motion.button>
                  );
                })}
              </motion.nav>

              {/* Categories — hidden if empty */}
              {categories.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="t-label-caps c-ink-faint">Categories</span>
                    <span className="h-px flex-1 bg-hairline" />
                  </div>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={subStagger}
                    className="space-y-0"
                  >
                    {categories.map((c) => (
                      <motion.button
                        key={c.slug}
                        variants={subItem}
                        onClick={() => goCategory(c.slug)}
                        className="group flex items-center justify-between w-full text-left py-2.5"
                      >
                        <span className="t-body-lg c-ink-muted group-hover:c-gold transition-colors">
                          {c.name}
                        </span>
                        {typeof c.productCount === "number" && (
                          <span className="t-caption c-ink-faint t-num group-hover:c-gold transition-colors">
                            {c.productCount}
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* Collections — hidden if empty */}
              {collections.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="t-label-caps c-ink-faint">Collections</span>
                    <span className="h-px flex-1 bg-hairline" />
                  </div>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={subStagger}
                    className="space-y-0"
                  >
                    {collections.map((col) => (
                      <motion.button
                        key={col.slug}
                        variants={subItem}
                        onClick={() => goCollection(col.slug)}
                        className="group block w-full text-left py-2.5"
                      >
                        <p className="t-body-lg c-ink-muted group-hover:c-gold transition-colors">
                          {col.name}
                        </p>
                        {col.description && (
                          <p className="t-caption c-ink-faint line-clamp-1 mt-0.5">
                            {col.description}
                          </p>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>

            {/* Footer — settings + concierge */}
            <div className="px-6 py-6 border-t border-hairline bg-canvas/40">
              <div className="flex items-center justify-between gap-4 mb-5">
                <span className="t-label-caps c-ink-faint">Preferences</span>
                <div className="flex items-center gap-1">
                  <ThemeToggle className="text-ink" />
                  <DisplayPreferences className="text-ink" />
                </div>
              </div>

              <p className="t-label-caps c-ink-faint mb-3">Concierge</p>
              <div className="space-y-2">
                <a
                  href="mailto:concierge@auraliving.com"
                  className="group flex items-center gap-3 t-body c-ink-muted hover:c-gold transition-colors"
                >
                  <Mail size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold transition-colors" />
                  <span>concierge@auraliving.com</span>
                </a>
                <a
                  href="tel:+923001234567"
                  className="group flex items-center gap-3 t-body c-ink-muted hover:c-gold transition-colors"
                >
                  <Phone size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold transition-colors" />
                  <span className="t-num">+92 300 1234567</span>
                </a>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileNav;
