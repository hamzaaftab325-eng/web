"use client";

import { useRef } from "react";

import { useRouter, usePathname } from "next/navigation";

import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { X, ChevronRight } from "lucide-react";

import { useFocusTrap } from "@/hooks/use-focus-trap";
import { RIGHT_DRAWER_CONSTRAINTS, rightDrawerDragEnd } from "@/lib/swipe-to-close";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";

type MainItem = {
  label: string;
  path: string;
  match: (pathname: string) => boolean;
  /** When true, the label is rendered in gold to draw attention. */
  highlight?: boolean;
};

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, open);
  const resetShop = useUIStore((s) => s.resetShop);
  const prefersReducedMotion = useReducedMotion();

  const close = () => setOpen(false);

  // Exact same links as desktop Header — nothing extra.
  const mainItems: MainItem[] = [
    { label: "Shop", path: "/shop", match: (p) => p.startsWith("/shop") },
    { label: "Collections", path: "/collections", match: (p) => p.startsWith("/collections") },
    { label: "About", path: "/about", match: (p) => p.startsWith("/about") },
    { label: "Journal", path: "/journal", match: (p) => p.startsWith("/journal") },
    { label: "Sale", path: "/sale", match: (p) => p.startsWith("/sale"), highlight: true },
  ];

  const go = (path: string) => {
    if (path === "/shop") resetShop();
    router.push(path);
    close();
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
            className="fixed top-0 right-0 bottom-0 z-[160] w-full max-w-[420px] bg-paper lg:hidden flex flex-col shadow-elevated safe-area-top safe-area-bottom"
          >
            {/* Drag handle (left edge) */}
            {!prefersReducedMotion && (
              <div className="absolute top-0 left-0 bottom-0 w-3 flex items-center justify-center cursor-ew-resize" aria-hidden>
                <div className="w-[3px] h-14 rounded-full bg-gold/30" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-hairline">
              <span className="t-headline-sm c-ink">Menu</span>
              <button
                onClick={close}
                aria-label="Close menu"
                className="p-2 -mr-2 text-ink hover:text-gold transition-colors rounded-full hover:bg-canvas/60"
              >
                <X size={22} strokeWidth={1.25} />
              </button>
            </div>

            {/* Nav — same four links as desktop */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-7">
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
                      onClick={() => go(item.path)}
                      className="group relative flex items-center justify-between w-full text-left py-4 border-b border-hairline"
                    >
                      <span
                        className={cn(
                          "absolute -left-3 top-1/2 -translate-y-1/2 w-[2px] rounded-full bg-gold transition-all duration-300",
                          isActive ? "h-6 opacity-100" : "h-0 opacity-0"
                        )}
                      />
                      <span
                        className={cn(
                          "t-display-md transition-colors",
                          isActive
                            ? "c-gold"
                            : item.highlight
                            ? "c-gold group-hover:c-gold-deep"
                            : "c-ink group-hover:c-gold"
                        )}
                      >
                        {item.label}
                      </span>
                      <ChevronRight
                        size={16}
                        strokeWidth={1.5}
                        className={cn(
                          "transition-all duration-300",
                          isActive
                            ? "c-gold opacity-100 translate-x-0"
                            : "c-ink-faint opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0"
                        )}
                      />
                    </motion.button>
                  );
                })}
              </motion.nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileNav;
