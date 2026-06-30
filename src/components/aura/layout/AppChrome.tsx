"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useUIStore } from "@/store/use-ui-store";
import { useAuthStore } from "@/store/use-auth-store";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { MobileTabBar } from "./MobileTabBar";
import { SearchOverlay } from "./SearchOverlay";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieConsent } from "@/components/analytics/CookieConsent";
import { CustomCursor } from "@/components/aura/ui/CustomCursor";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useProductBySlug } from "@/hooks/queries/use-product-by-slug";
import { usePageViewTracking } from "@/hooks/use-tracking";
import { useSettings } from "@/hooks/use-settings";

// Lazy-load heavy overlay components — only loaded when needed
// This reduces initial bundle size by ~40KB+ (CheckoutFlow, ProductDetailPage, etc.)
const CartDrawer = dynamic(() => import("@/components/aura/commerce/CartDrawer").then(m => ({ default: m.CartDrawer })), { ssr: false });
const WishlistDrawer = dynamic(() => import("@/components/aura/commerce/WishlistDrawer").then(m => ({ default: m.WishlistDrawer })), { ssr: false });
const QuickViewModal = dynamic(() => import("@/components/aura/commerce/QuickViewModal").then(m => ({ default: m.QuickViewModal })), { ssr: false });
const CompareTray = dynamic(() => import("@/components/aura/commerce/CompareTray").then(m => ({ default: m.CompareTray })), { ssr: false });
const CheckoutFlow = dynamic(() => import("@/components/aura/commerce/CheckoutFlow").then(m => ({ default: m.CheckoutFlow })), { ssr: false });
const RecentlyViewed = dynamic(() => import("@/components/aura/commerce/RecentlyViewed").then(m => ({ default: m.RecentlyViewed })), { ssr: false });
const ExitIntentPopup = dynamic(() => import("@/components/aura/marketing/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })), { ssr: false });
const FirstOrderBanner = dynamic(() => import("@/components/aura/marketing/FirstOrderBanner").then(m => ({ default: m.FirstOrderBanner })), { ssr: false });
const JournalReader = dynamic(() => import("@/components/aura/sections/JournalReader").then(m => ({ default: m.JournalReader })), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/analytics/InstallPrompt").then(m => ({ default: m.InstallPrompt })), { ssr: false });

/**
 * AppChrome — the persistent UI shell that wraps every page.
 *
 * Renders: Header, Footer, MobileNav, MobileTabBar, SearchOverlay,
 * CartDrawer, WishlistDrawer, CompareTray, CheckoutFlow, ExitIntentPopup,
 * FirstOrderBanner, CookieConsent, InstallPrompt, AnalyticsProvider,
 * JournalReader (overlay), QuickViewModal, ProductDetailPage (overlay).
 *
 * Used in app/layout.tsx to wrap {children}. Each route page renders
 * its own view component as children — this is real Next.js App Router
 * architecture (not a catch-all with client-side view switching).
 *
 * Also handles product detail overlay (quick view from any page) and
 * scrolls to top on route change.
 */

const AUTH_PATHS = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  useKeyboardShortcuts();
  usePageViewTracking();
  useSettings(); // Loads store settings + updates currency symbol globally

  const quickViewSlug = useUIStore((s) => s.quickViewProductSlug);
  const setQuickViewProduct = useUIStore((s) => s.setQuickViewProduct);

  // Auth hydration — fetch the current user from the httpOnly cookie on mount.
  // Keeps the Zustand store in sync after a page refresh or a returning visit.
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const clearAuth = useAuthStore((s) => s.clear);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.user) {
          setUser(data.user);
          // The token field in the store is only used as a UI flag — the real
          // auth token lives in the httpOnly cookie set by the server.
          setToken("httpOnly");
        } else {
          // Cookie missing / expired — clear any stale localStorage user.
          clearAuth();
        }
      })
      .catch(() => {
        // Network errors are non-fatal — leave the persisted store as-is.
      });
    return () => { cancelled = true; };
  }, [setUser, setToken, clearAuth]);

  const isAuthPage = AUTH_PATHS.has(pathname);
  const isProductPage = pathname.startsWith("/product/");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [pathname, prefersReducedMotion]);

  const { data: quickViewProduct } = useProductBySlug(quickViewSlug);

  return (
    <AnalyticsProvider>
      <CustomCursor />
      <div className="min-h-screen flex flex-col bg-canvas">
        {!isAuthPage && <FirstOrderBanner />}
        {!isAuthPage && <Header />}
        {!isAuthPage && <MobileNav />}
        {!isAuthPage && <SearchOverlay />}
        {!isAuthPage && <CartDrawer />}
        {!isAuthPage && <WishlistDrawer />}
        {!isAuthPage && <CompareTray />}
        {!isAuthPage && <CheckoutFlow />}
        {!isAuthPage && <ExitIntentPopup />}

        {/* Product detail page overlay (triggered from quick view / compare) */}
        {/* Quick view modal */}
        <QuickViewModal product={quickViewProduct ?? null} onClose={() => setQuickViewProduct(null)} />

        {/* Journal article reader overlay */}
        <JournalReader />

        <main id="main" className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {!isAuthPage && <Footer />}
        {!isAuthPage && pathname !== "/product" && !pathname.startsWith("/product/") && <MobileTabBar />}
        <CookieConsent />
        <InstallPrompt />
      </div>
    </AnalyticsProvider>
  );
}

export default AppChrome;
