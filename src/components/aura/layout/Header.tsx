"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, X, User } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useCategories, useCollections } from "@/hooks/queries/use-catalog";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/aura/ui/ThemeToggle";
import { DisplayPreferences } from "@/components/aura/ui/DisplayPreferences";

const navLinks: { label: string; view: "shop" | "about" | "journal" }[] = [
  { label: "Shop", view: "shop" },
  { label: "Collections", view: "shop" },
  { label: "About", view: "about" },
  { label: "Journal", view: "journal" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();

  const setCategory = useUIStore((s) => s.setCategory);
  const setCollection = useUIStore((s) => s.setCollection);
  const resetShop = useUIStore((s) => s.resetShop);
  const openMobile = useUIStore((s) => s.setMobileNavOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const openCart = useCartStore((s) => s.openCart);

  const wishCount = useWishlistStore((s) => s.slugs.length);
  const openWishlist = useWishlistStore((s) => s.openDrawer);

  const user = useAuthStore((s) => s.user);

  const prefersReducedMotion = useReducedMotion();

  // Pages with light/cream backgrounds (no dark hero image) need dark header text.
  // Account, admin, product detail, cart, and auth pages all have cream backgrounds.
  // Home page + content pages (about, journal, collections, sustainability,
  // care, shop) have dark image heroes — white header text when not scrolled.
  const LIGHT_PAGE_PREFIXES = ["/account", "/admin", "/product", "/cart", "/login", "/signup", "/forgot-password", "/reset-password"];
  const isLightPage = LIGHT_PAGE_PREFIXES.some(prefix => pathname.startsWith(prefix));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goShop = () => {
    resetShop();
    router.push("/shop");
    setMegaOpen(false);
  };

  const goCategory = (slug: string) => {
    setCategory(slug as never);
    router.push("/shop");
    setMegaOpen(false);
  };

  const goCollection = (slug: string) => {
    setCollection(slug);
    router.push("/shop");
    setMegaOpen(false);
  };

  const goHome = () => router.push("/");
  const goAbout = () => router.push("/about");
  const goJournal = () => router.push("/journal");
  const goCollections = () => router.push("/collections");
  const goAccount = () => {
    if (!user) {
      router.push("/login");
    } else if (user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/account");
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-sticky transition-all duration-500",
        (scrolled || isLightPage) ? "glass-nav h-[60px] md:h-[72px]" : "bg-transparent h-[72px] md:h-[88px]"
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
            className={cn("lg:hidden p-2 -ml-2 transition-colors hover:text-gold", (scrolled || isLightPage) ? "text-ink" : "hero-text")}
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.25} />
          </button>

          {/* Logo — swaps between dark and white version based on scroll/hero state */}
          <button
            onClick={goHome}
            className="flex-shrink-0 flex items-center gap-2 group"
            aria-label="Aura Living home"
          >
            <img
              src={(scrolled || isLightPage) ? "/logo.svg" : "/logo-white.svg"}
              alt="Aura Living"
              className="h-7 md:h-9 w-auto transition-opacity group-hover:opacity-80"
              fetchPriority="high"
            />
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
                data-active={pathname === "/shop"}
                className={cn("t-label-caps link-underline transition-colors hover:c-gold", (scrolled || isLightPage) ? "c-ink" : "hero-text")}
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
                onClick={goCollections}
                data-active={pathname === "/collections"}
                className={cn("t-label-caps link-underline transition-colors hover:c-gold", (scrolled || isLightPage) ? "c-ink" : "hero-text")}
              >
                Collections
              </button>
            </div>

            <button
              onClick={goAbout}
              data-active={pathname === "/about"}
              className={cn("t-label-caps link-underline transition-colors hover:c-gold", (scrolled || isLightPage) ? "c-ink" : "hero-text")}
            >
              About
            </button>

            <button
              onClick={goJournal}
              data-active={pathname === "/journal"}
              className={cn("t-label-caps link-underline transition-colors hover:c-gold", (scrolled || isLightPage) ? "c-ink" : "hero-text")}
            >
              Journal
            </button>
          </nav>

          {/* Utility icons — only essential icons on mobile */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme + Settings — desktop only (hidden on mobile to avoid clutter) */}
            <ThemeToggle
              className={cn(
                "p-1 hidden lg:flex",
                (scrolled || isLightPage) ? "text-ink" : "hero-text"
              )}
            />
            <DisplayPreferences
              className={cn(
                "p-1 hidden lg:flex",
                (scrolled || isLightPage) ? "text-ink" : "hero-text"
              )}
            />
            <button
              onClick={goAccount}
              aria-label={user ? "Account" : "Sign in"}
              className={cn("transition-colors p-1 relative hover:text-gold", (scrolled || isLightPage) ? "text-ink" : "hero-text")}
            >
              <User size={20} strokeWidth={1.25} />
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={cn("transition-colors p-1 hover:text-gold", (scrolled || isLightPage) ? "text-ink" : "hero-text")}
            >
              <Search size={20} strokeWidth={1.25} />
            </button>

            <button
              onClick={openWishlist}
              aria-label={`Wishlist, ${wishCount} items`}
              className={cn("transition-colors p-1 relative hover:text-gold", (scrolled || isLightPage) ? "text-ink" : "hero-text")}
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
              className={cn("transition-colors p-1 relative hover:text-gold", (scrolled || isLightPage) ? "text-ink" : "hero-text")}
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
