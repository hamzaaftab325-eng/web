"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Search, Heart, ShoppingBag, Menu, User } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/aura/ui/ThemeToggle";
import { DisplayPreferences } from "@/components/aura/ui/DisplayPreferences";
import { useThemeStore } from "@/store/use-theme-store";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const resetShop = useUIStore((s) => s.resetShop);
  const openMobile = useUIStore((s) => s.setMobileNavOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const openCart = useCartStore((s) => s.openCart);

  const wishCount = useWishlistStore((s) => s.slugs.length);
  const openWishlist = useWishlistStore((s) => s.openDrawer);

  const user = useAuthStore((s) => s.user);

  const prefersReducedMotion = useReducedMotion();

  const LIGHT_PAGE_PREFIXES = ["/account", "/admin", "/product", "/cart", "/login", "/signup", "/forgot-password", "/reset-password"];
  const isLightPage = LIGHT_PAGE_PREFIXES.some(prefix => pathname.startsWith(prefix));

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const checkDark = () => {
      const theme = useThemeStore.getState().mode;
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(theme === "dark" || (theme === "system" && systemDark));
    };
    checkDark();
    const unsub = useThemeStore.subscribe(checkDark);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => checkDark();
    mq.addEventListener("change", onChange);
    return () => {
      unsub();
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const useLightLogo = isDarkMode || (!scrolled && !isLightPage);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        "fixed top-0 inset-x-0 z-sticky transition-all duration-500 safe-area-top",
        (scrolled || isLightPage) ? "glass-nav h-[60px] md:h-[72px]" : "bg-transparent h-[72px] md:h-[88px]"
      )}
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

          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center group"
            aria-label="Aura Living home"
          >
            <img
              src={useLightLogo ? "/logo-white.svg" : "/logo-black.svg"}
              alt="Aura Living"
              className="h-9 sm:h-11 md:h-12 lg:h-14 w-auto transition-all duration-300 group-hover:opacity-85"
              fetchPriority="high"
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-10 flex-1 justify-center">
            <Link
              href="/shop"
              onClick={resetShop}
              data-active={pathname === "/shop"}
              className={cn("t-label-caps link-underline transition-colors hover:c-gold", (scrolled || isLightPage) ? "c-ink" : "hero-text")}
            >
              Shop
            </Link>

            <Link
              href="/collections"
              data-active={pathname === "/collections"}
              className={cn("t-label-caps link-underline transition-colors hover:c-gold", (scrolled || isLightPage) ? "c-ink" : "hero-text")}
            >
              Collections
            </Link>

            <Link
              href="/about"
              data-active={pathname === "/about"}
              className={cn("t-label-caps link-underline transition-colors hover:c-gold", (scrolled || isLightPage) ? "c-ink" : "hero-text")}
            >
              About
            </Link>

            <Link
              href="/journal"
              data-active={pathname === "/journal"}
              className={cn("t-label-caps link-underline transition-colors hover:c-gold", (scrolled || isLightPage) ? "c-ink" : "hero-text")}
            >
              Journal
            </Link>

            {/* Sale — visually distinct (gold) to draw attention */}
            <Link
              href="/sale"
              data-active={pathname === "/sale"}
              className="t-label-caps link-underline transition-colors c-gold hover:c-gold-deep"
            >
              Sale
            </Link>
          </nav>

          {/* Utility icons */}
          <div className="flex items-center gap-3 md:gap-4">
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
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-paper t-num font-semibold rounded-full h-4 min-w-4 px-1 text-[10px] flex items-center justify-center t-num">
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
                  className="absolute -top-1.5 -right-1.5 bg-gold text-paper t-num font-semibold rounded-full h-4 min-w-4 px-1 text-[10px] flex items-center justify-center t-num"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;