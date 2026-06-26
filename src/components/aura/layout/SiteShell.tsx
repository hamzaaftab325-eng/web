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
import { ProductDetail } from "@/components/aura/commerce/ProductDetail";

import { HeroSection } from "@/components/aura/sections/HeroSection";
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

export function SiteShell() {
  const view = useUIStore((s) => s.view);
  const prefersReducedMotion = useReducedMotion();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [view, prefersReducedMotion]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header />
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <WishlistDrawer />
      <ProductDetail />

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
                <HeroSection />
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
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default SiteShell;
