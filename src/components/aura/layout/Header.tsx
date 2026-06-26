"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { categories } from "@/data/categories";
import { collections } from "@/data/collections";
import { cn } from "@/lib/utils";

const navLinks: { label: string; view: "shop" | "about" | "journal" }[] = [
  { label: "Shop", view: "shop" },
  { label: "Collections", view: "shop" },
  { label: "About", view: "about" },
  { label: "Journal", view: "journal" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const setView = useUIStore((s) => s.setView);
  const setCategory = useUIStore((s) => s.setCategory);
  const setCollection = useUIStore((s) => s.setCollection);
  const resetShop = useUIStore((s) => s.resetShop);
  const view = useUIStore((s) => s.view);
  const openMobile = useUIStore((s) => s.setMobileNavOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const openCart = useCartStore((s) => s.openCart);

  const wishCount = useWishlistStore((s) => s.slugs.length);
  const openWishlist = useWishlistStore((s) => s.openDrawer);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goShop = () => {
    resetShop();
    setView("shop");
    setMegaOpen(false);
  };

  const goCategory = (slug: string) => {
    setCategory(slug as never);
    setMegaOpen(false);
  };

  const goCollection = (slug: string) => {
    setCollection(slug);
    setMegaOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-500",
        scrolled ? "glass-nav h-[60px] md:h-[72px]" : "bg-transparent h-[72px] md:h-[88px]"
      )}
      onMouseLeave={() => {
        setMegaOpen(false);
        setHovered(null);
      }}
    >
      <div className="container-aura h-full">
        <div className="flex items-center justify-between h-full gap-6">
          {/* Mobile menu button */}
          <button
            onClick={() => openMobile(true)}
            className="lg:hidden p-2 -ml-2 text-ink hover:text-gold transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.25} />
          </button>

          {/* Logo */}
          <button
            onClick={() => setView("home")}
            className="flex-shrink-0 flex items-center gap-2 group"
            aria-label="Aura Living home"
          >
            <span className="t-display-md font-display c-ink leading-none tracking-tight">
              Aura
            </span>
            <span className="t-label-caps c-gold hidden sm:inline-block self-end mb-[6px]">
              Living
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-10 flex-1 justify-center">
            <div
              onMouseEnter={() => {
                setMegaOpen(true);
                setHovered("shop");
              }}
              className="relative"
            >
              <button
                onClick={goShop}
                data-active={view === "shop"}
                className="t-label-caps link-underline c-ink hover:c-gold transition-colors"
              >
                Shop
              </button>
            </div>

            <div
              onMouseEnter={() => {
                setMegaOpen(true);
                setHovered("collections");
              }}
              className="relative"
            >
              <button
                onClick={() => goCollection(collections[0].slug)}
                data-active={false}
                className="t-label-caps link-underline c-ink hover:c-gold transition-colors"
              >
                Collections
              </button>
            </div>

            <button
              onClick={() => setView("about")}
              data-active={view === "about"}
              className="t-label-caps link-underline c-ink hover:c-gold transition-colors"
            >
              About
            </button>

            <button
              onClick={() => setView("journal")}
              data-active={view === "journal"}
              className="t-label-caps link-underline c-ink hover:c-gold transition-colors"
            >
              Journal
            </button>
          </nav>

          {/* Utility icons */}
          <div className="flex items-center gap-4 md:gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="text-ink hover:text-gold transition-colors p-1"
            >
              <Search size={20} strokeWidth={1.25} />
            </button>

            <button
              onClick={openWishlist}
              aria-label={`Wishlist, ${wishCount} items`}
              className="text-ink hover:text-gold transition-colors p-1 relative"
            >
              <Heart size={20} strokeWidth={1.25} />
              {wishCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-paper text-[10px] font-semibold rounded-full h-[16px] min-w-[16px] px-1 flex items-center justify-center t-num">
                  {wishCount}
                </span>
              )}
            </button>

            <button
              onClick={openCart}
              aria-label={`Cart, ${cartCount} items`}
              className="text-ink hover:text-gold transition-colors p-1 relative"
            >
              <ShoppingBag size={20} strokeWidth={1.25} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={prefersReducedMotion ? false : { scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute -top-1.5 -right-1.5 bg-gold text-paper text-[10px] font-semibold rounded-full h-[16px] min-w-[16px] px-1 flex items-center justify-center t-num"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mega menu */}
      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block absolute top-full left-0 right-0 glass-nav border-t border-hairline shadow-ambient"
            onMouseEnter={() => setMegaOpen(true)}
          >
            <div className="container-aura py-10">
              {hovered === "shop" ? (
                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-1">
                    <p className="t-label-caps c-ink-faint mb-4">Browse</p>
                    <button
                      onClick={goShop}
                      className="block t-headline-sm c-ink hover:c-gold transition-colors mb-3 link-underline"
                    >
                      All Products
                    </button>
                    <div className="space-y-2">
                      {categories.map((c) => (
                        <button
                          key={c.slug}
                          onClick={() => goCategory(c.slug)}
                          className="block t-body c-ink-muted hover:c-gold transition-colors link-underline text-left"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 grid grid-cols-3 gap-4">
                    {categories.slice(0, 3).map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => goCategory(c.slug)}
                        className="group text-left"
                      >
                        <div className="aspect-[4/5] overflow-hidden bg-cream mb-3">
                          <img
                            src={c.heroImage}
                            alt={c.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <p className="t-headline-sm c-ink group-hover:c-gold transition-colors">
                          {c.name}
                        </p>
                        <p className="t-caption c-ink-faint mt-1">
                          {c.productCount} pieces
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-8">
                  {collections.map((col) => (
                    <button
                      key={col.slug}
                      onClick={() => goCollection(col.slug)}
                      className="group text-left"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-cream mb-4">
                        <img
                          src={col.heroImage}
                          alt={col.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <p className="t-headline-sm c-ink group-hover:c-gold transition-colors">
                        {col.name}
                      </p>
                      <p className="t-body-sm c-ink-muted mt-2 line-clamp-2">
                        {col.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
