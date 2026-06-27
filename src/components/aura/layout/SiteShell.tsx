"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useUIStore } from "@/store/use-ui-store";
import { productBySlug } from "@/data/products";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
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

import { HeroSlider } from "@/components/aura/sections/HeroSlider";
import { CategoryShowcase } from "@/components/aura/sections/CategoryShowcase";
import { BrandMarquee } from "@/components/aura/sections/BrandMarquee";
import { FeaturedProducts } from "@/components/aura/sections/FeaturedProducts";
import { CuratedCollection } from "@/components/aura/sections/CuratedCollection";
import { TestimonialSection } from "@/components/aura/sections/TestimonialSection";
import { BrandValues } from "@/components/aura/sections/BrandValues";
import { NewsletterSection } from "@/components/aura/sections/NewsletterSection";
import { InstagramFeed } from "@/components/aura/sections/InstagramFeed";
import { FAQSection } from "@/components/aura/sections/FAQSection";
import { PressSection } from "@/components/aura/sections/PressSection";
import { ShopView } from "@/components/aura/sections/ShopView";
import { AboutView } from "@/components/aura/sections/AboutView";
import { JournalView } from "@/components/aura/sections/JournalView";
import { LookbookView } from "@/components/aura/sections/LookbookView";
import { CollectionsView } from "@/components/aura/sections/CollectionsView";
import { ArtisansView } from "@/components/aura/sections/ArtisansView";
import { SustainabilityView } from "@/components/aura/sections/SustainabilityView";
import { TradeView } from "@/components/aura/sections/TradeView";
import { GiftsView } from "@/components/aura/sections/GiftsView";
import { CareView } from "@/components/aura/sections/CareView";
import { JournalReader } from "@/components/aura/sections/JournalReader";

import { AccountDashboard } from "@/components/aura/account/AccountDashboard";
import { AccountOrders } from "@/components/aura/account/AccountOrders";
import { AccountOrderDetail } from "@/components/aura/account/AccountOrderDetail";
import { AccountAddresses } from "@/components/aura/account/AccountAddresses";
import { AccountWishlist } from "@/components/aura/account/AccountWishlist";
import { AccountPreferences } from "@/components/aura/account/AccountPreferences";

import { LoginView } from "@/components/aura/auth/LoginView";
import { SignupView } from "@/components/aura/auth/SignupView";
import { ForgotPasswordView } from "@/components/aura/auth/ForgotPasswordView";
import { ResetPasswordView } from "@/components/aura/auth/ResetPasswordView";

const AUTH_VIEWS = new Set(["login", "signup", "forgot-password", "reset-password"]);

export function SiteShell() {
  const view = useUIStore((s) => s.view);
  const activeProductSlug = useUIStore((s) => s.activeProductSlug);
  const quickViewSlug = useUIStore((s) => s.quickViewProductSlug);
  const openProduct = useUIStore((s) => s.openProduct);
  const setQuickViewProduct = useUIStore((s) => s.setQuickViewProduct);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [view, prefersReducedMotion]);

  const activeProduct = activeProductSlug ? productBySlug(activeProductSlug) : undefined;
  const quickViewProduct = quickViewSlug ? productBySlug(quickViewSlug) ?? null : null;
  const isAuthView = AUTH_VIEWS.has(view);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {!isAuthView && <FirstOrderBanner />}
      {!isAuthView && <Header />}
      {!isAuthView && <MobileNav />}
      {!isAuthView && <SearchOverlay />}
      {!isAuthView && <CartDrawer />}
      {!isAuthView && <WishlistDrawer />}
      {!isAuthView && <CompareTray />}
      {!isAuthView && <CheckoutFlow />}
      {!isAuthView && <ExitIntentPopup />}

      {/* Product detail page overlay */}
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
            key={view}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {view === "home" && (
              <>
                <HeroSlider />
                <CategoryShowcase />
                <BrandMarquee />
                <FeaturedProducts />
                <CuratedCollection />
                <TestimonialSection />
                <BrandValues />
                <PressSection />
                <InstagramFeed />
                <RecentlyViewed />
                <NewsletterSection />
                <FAQSection />
              </>
            )}
            {view === "shop" && <ShopView />}
            {view === "about" && <AboutView />}
            {view === "journal" && <JournalView />}
            {view === "lookbook" && <LookbookView />}
            {view === "collections" && <CollectionsView />}
            {view === "artisans" && <ArtisansView />}
            {view === "sustainability" && <SustainabilityView />}
            {view === "trade" && <TradeView />}
            {view === "gifts" && <GiftsView />}
            {view === "care" && <CareView />}
            {view === "account" && <AccountDashboard />}
            {view === "account-orders" && <AccountOrders />}
            {view === "account-order-detail" && <AccountOrderDetail />}
            {view === "account-addresses" && <AccountAddresses />}
            {view === "account-wishlist" && <AccountWishlist />}
            {view === "account-preferences" && <AccountPreferences />}
            {view === "login" && <LoginView />}
            {view === "signup" && <SignupView />}
            {view === "forgot-password" && <ForgotPasswordView />}
            {view === "reset-password" && <ResetPasswordView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAuthView && <Footer />}
    </div>
  );
}

export default SiteShell;
