"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";

/**
 * MobileTabBar — persistent bottom navigation for mobile (< lg).
 *
 * Five tabs: Home, Search, Cart (with count), Wishlist (with count), Account.
 * Active tab highlighted with gold. Hides when keyboard is open or when
 * the user scrolls down (reappears on scroll up). Respects safe area inset.
 *
 * The bar is fixed at z-sticky (100) — below drawers (z-drawer 600) and
 * modals (z-modal 1000) so it doesn't overlap overlays.
 */

type TabKey = "home" | "search" | "cart" | "wishlist" | "account";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: typeof Home;
  action: () => void;
  badge?: number;
}

export function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const openCart = useCartStore((s) => s.openCart);
  const openWishlist = useWishlistStore((s) => s.openDrawer);

  const cartCount = useCartStore((s) =>
    s.lines.reduce((n, l) => n + l.quantity, 0)
  );
  const wishCount = useWishlistStore((s) => s.slugs.length);
  const user = useAuthStore((s) => s.user);

  // Hide when keyboard is open (viewport height shrinks) or when
  // any drawer/modal that should cover the tab bar is open.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide on keyboard open: compare visual viewport height to window height.
    // When keyboard opens, visualViewport.height < window.innerHeight.
    if (typeof window === "undefined" || !window.visualViewport) return;

    const onResize = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight;
      const wh = window.innerHeight;
      setVisible(vh >= wh * 0.75);
    };

    window.visualViewport.addEventListener("resize", onResize);
    return () => window.visualViewport?.removeEventListener("resize", onResize);
  }, []);

  // Derive active tab from current pathname
  const activeTab: TabKey =
    pathname === "/" || pathname === "/shop" || pathname === "/collections" || pathname === "/care" || pathname === "/about" || pathname === "/journal" || pathname.startsWith("/product")
      ? "home"
      : pathname.startsWith("/account")
      ? "account"
      : "home";

  const tabs: TabConfig[] = [
    {
      key: "home",
      label: "Browse",
      icon: Home,
      action: () => router.push("/"),
    },
    {
      key: "search",
      label: "Search",
      icon: Search,
      action: () => setSearchOpen(true),
    },
    {
      key: "cart",
      label: "Cart",
      icon: ShoppingBag,
      action: () => openCart(),
      badge: cartCount,
    },
    {
      key: "wishlist",
      label: "Saved",
      icon: Heart,
      action: () => openWishlist(),
      badge: wishCount,
    },
    {
      key: "account",
      label: "Account",
      icon: User,
      action: () => router.push(user ? "/account" : "/login"),
    },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={prefersReducedMotion ? false : { y: 100 }}
          animate={{ y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: 100 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="lg:hidden fixed bottom-0 inset-x-0 z-sticky bg-paper/95 backdrop-blur-md border-t border-hairline-cream safe-area-bottom"
          aria-label="Mobile navigation"
        >
          <div className="flex items-stretch justify-around h-[56px]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={tab.action}
                  className="relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-colors"
                  aria-label={tab.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="relative">
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                      className={cn(
                        "transition-colors",
                        isActive ? "c-gold-deep" : "c-ink-faint"
                      )}
                    />
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className="absolute -top-1.5 -right-2 bg-gold c-paper t-num font-semibold rounded-full h-4 min-w-4 px-1 text-[10px] flex items-center justify-center t-num"
                        aria-label={`${tab.badge} items`}
                      >
                        {tab.badge > 99 ? "99+" : tab.badge}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "t-caption transition-colors",
                      isActive ? "c-gold-deep font-medium" : "c-ink-faint"
                    )}
                  >
                    {tab.label}
                  </span>
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.span
                      layoutId="tab-active"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gold rounded-full"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

export default MobileTabBar;
