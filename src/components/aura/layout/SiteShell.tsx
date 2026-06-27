"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useUIStore } from "@/store/use-ui-store";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { SearchOverlay } from "./SearchOverlay";
import { CartDrawer } from "@/components/aura/commerce/CartDrawer";
import { WishlistDrawer } from "@/components/aura/commerce/WishlistDrawer";
import { ProductDetailPage } from "@/components/aura/commerce/ProductDetailPage";
import { productBySlug } from "@/data/products";

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
import { ShopView } from "@/components/aura/sections/ShopView";
import { AboutView } from "@/components/aura/sections/AboutView";
import { JournalView } from "@/components/aura/sections/JournalView";

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

export function SiteShell() {
  const view = useUIStore((s) => s.view);
  const activeProductSlug = useUIStore((s) => s.activeProductSlug);
  const openProduct = useUIStore((s) => s.openProduct);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [view, prefersReducedMotion]);

  const activeProduct = activeProductSlug ? productBySlug(activeProductSlug) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header />
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <WishlistDrawer />

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
                <InstagramFeed />
                <NewsletterSection />
                <FAQSection />
              </>
            )}
            {view === "shop" && <ShopView />}
            {view === "about" && <AboutView />}
            {view === "journal" && <JournalView />}
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
            {view === "product-detail" && activeProduct && (
              <ProductDetailPage
                product={activeProduct}
                onBack={() => openProduct(null)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default SiteShell;
