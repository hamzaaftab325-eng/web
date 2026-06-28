"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useUIStore } from "@/store/use-ui-store";
import { productBySlug } from "@/data/products";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { MobileTabBar } from "./MobileTabBar";
import { SearchOverlay } from "./SearchOverlay";
import { CartDrawer } from "@/components/aura/commerce/CartDrawer";
import { WishlistDrawer } from "@/components/aura/commerce/WishlistDrawer";
import { ProductDetailPage } from "@/components/aura/commerce/ProductDetailPage";
import { QuickViewModal } from "@/components/aura/commerce/QuickViewModal";
import { CompareTray } from "@/components/aura/commerce/CompareTray";
import { CheckoutFlow } from "@/components/aura/commerce/CheckoutFlow";
import { RecentlyViewed } from "@/components/aura/commerce/RecentlyViewed";
import { ExitIntentPopup } from "@/components/aura/marketing/ExitIntentPopup";
import { FirstOrderBanner } from "@/components/aura/marketing/FirstOrderBanner";
import { JournalReader } from "@/components/aura/sections/JournalReader";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieConsent } from "@/components/analytics/CookieConsent";
import { InstallPrompt } from "@/components/analytics/InstallPrompt";
import { CustomCursor } from "@/components/aura/ui/CustomCursor";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

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

  const activeProductSlug = useUIStore((s) => s.activeProductSlug);
  const quickViewSlug = useUIStore((s) => s.quickViewProductSlug);
  const openProduct = useUIStore((s) => s.openProduct);
  const setQuickViewProduct = useUIStore((s) => s.setQuickViewProduct);

  const isAuthPage = AUTH_PATHS.has(pathname);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [pathname, prefersReducedMotion]);

  const activeProduct = activeProductSlug ? productBySlug(activeProductSlug) : undefined;
  const quickViewProduct = quickViewSlug ? productBySlug(quickViewSlug) ?? null : null;

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
        {activeProduct && (
          <ProductDetailPage product={activeProduct} onBack={() => openProduct(null)} />
        )}

        {/* Quick view modal */}
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

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
