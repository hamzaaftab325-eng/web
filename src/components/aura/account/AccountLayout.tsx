"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LayoutDashboard, Package, MapPin, Heart, Settings, LogOut, Menu, X, ShoppingBag, ChevronRight } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { useCartStore } from "@/store/use-cart-store";
import { cn } from "@/lib/utils";

const navItems: { label: string; icon: typeof LayoutDashboard; path: string }[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/account" },
  { label: "Orders", icon: Package, path: "/account/orders" },
  { label: "Addresses", icon: MapPin, path: "/account/addresses" },
  { label: "Wishlist", icon: Heart, path: "/account/wishlist" },
  { label: "Preferences", icon: Settings, path: "/account/preferences" },
];

export function AccountLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { filterDrawerOpen, setFilterDrawerOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);
  const wishCount = useWishlistStore((s) => s.slugs.length);
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Give the AppChrome auth hydration (fetch /api/auth/me) one tick to resolve
    // before deciding the user is missing. Avoids spurious redirects on refresh.
    const t = setTimeout(() => setHydrated(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hydrated && !user) {
      router.push("/login?redirect=" + encodeURIComponent(pathname));
    }
  }, [hydrated, user, router, pathname]);

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="aura-loader-ring"><span className="aura-loader-dot" /></div>
      </div>
    );
  }

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  const go = (path: string) => {
    router.push(path);
    setFilterDrawerOpen(false);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-hairline-cream relative overflow-hidden bg-gradient-gold">
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ink to-ink/80 flex items-center justify-center flex-shrink-0 shadow-glow-gold ring-2 ring-gold/20">
            <span className="t-label-caps c-paper">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="t-body c-ink font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="t-caption c-ink-faint truncate">{user.email}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <p className="t-label-caps c-ink-faint px-4 mb-2 mt-2 flex items-center gap-2"><span className="w-4 h-px bg-gold/40" aria-hidden />Menu</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const badge = item.path === "/account/wishlist" ? wishCount : item.path === "/account/orders" ? 2 : 0;
            return (
              <li key={item.path}>
                <button onClick={() => go(item.path)} className={cn("w-full flex items-center gap-3 px-4 py-3 t-body transition-all duration-300 relative group rounded-sm", isActive ? "c-ink font-medium" : "c-ink-muted hover:c-ink hover:bg-cream/60")}>
                  {isActive && <motion.span layoutId="account-nav-active" className="absolute inset-0 bg-gold-pale rounded-sm border border-gold/40 shadow-glow-gold" transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />}
                  {isActive && <motion.span layoutId="account-nav-bar" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gold rounded-r-full" transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />}
                  <item.icon size={18} strokeWidth={isActive ? 1.5 : 1.25} className={cn("flex-shrink-0 relative z-10 transition-colors", isActive ? "c-gold-deep" : "group-hover:c-gold")} />
                  <span className="flex-1 text-left relative z-10">{item.label}</span>
                  {badge > 0 && <span className={cn("t-caption t-num px-2 py-0.5 rounded-full relative z-10", isActive ? "bg-gold c-paper font-semibold" : "bg-cream-deep c-ink-faint")}>{badge}</span>}
                  {isActive && <ChevronRight size={14} strokeWidth={2} className="c-gold-deep relative z-10" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-hairline-cream">
        <button onClick={async () => {
          // Hit the server logout endpoint to clear the httpOnly auth cookies.
          try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* best-effort */ }
          clearAuth();
          router.push("/");
        }} className="w-full flex items-center gap-3 px-4 py-3 t-body c-ink-muted hover:c-error transition-colors group rounded-sm hover:bg-error/5">
          <LogOut size={18} strokeWidth={1.25} className="group-hover:scale-110 transition-transform" />Sign Out
        </button>
      </div>
      <div className="p-4 border-t border-hairline-cream grid grid-cols-2 gap-2">
        <button onClick={() => useCartStore.getState().openCart()} className="flex flex-col items-center justify-center gap-1 py-3 border border-hairline-cream bg-cream/50 hover:bg-cream hover:border-hairline-gold transition-colors group rounded-sm">
          <div className="relative"><ShoppingBag size={18} strokeWidth={1.25} className="c-ink group-hover:c-gold-deep transition-colors" />{cartCount > 0 && <span className="absolute -top-2 -right-2 bg-gold c-paper text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center t-num">{cartCount}</span>}</div>
          <span className="t-caption c-ink-faint">Cart</span>
        </button>
        <button onClick={() => go("/account/wishlist")} className="flex flex-col items-center justify-center gap-1 py-3 border border-hairline-cream bg-cream/50 hover:bg-cream hover:border-hairline-gold transition-colors group rounded-sm">
          <div className="relative"><Heart size={18} strokeWidth={1.25} className="c-ink group-hover:c-gold-deep transition-colors" />{wishCount > 0 && <span className="absolute -top-2 -right-2 bg-gold c-paper text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center t-num">{wishCount}</span>}</div>
          <span className="t-caption c-ink-faint">Saved</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-aura pt-24 md:pt-28 pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button onClick={() => setFilterDrawerOpen(true)} className="inline-flex items-center gap-2 t-label-caps c-ink border border-hairline-cream px-4 py-2.5 rounded-sm"><Menu size={14} strokeWidth={1.5} />Account Menu</button>
            <div className="flex items-center gap-2 t-caption c-ink-faint"><span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden />Signed in</div>
          </div>
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-[100px] bg-gradient-sidebar border border-hairline-cream shadow-premium overflow-hidden rounded-sm">{sidebar}</div>
          </aside>
          <AnimatePresence>
            {filterDrawerOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={() => setFilterDrawerOpen(false)} className="fixed inset-0 z-overlay overlay-dark lg:hidden" />
                <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="fixed top-0 left-0 bottom-0 z-drawer w-full max-w-[360px] bg-paper lg:hidden shadow-modal">
                  <button onClick={() => setFilterDrawerOpen(false)} aria-label="Close menu" className="absolute top-4 right-4 p-2 c-ink hover:c-gold-deep transition-colors z-10"><X size={22} strokeWidth={1.25} /></button>
                  {sidebar}
                </motion.aside>
              </>
            )}
          </AnimatePresence>
          <main className="lg:col-span-9 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default AccountLayout;
