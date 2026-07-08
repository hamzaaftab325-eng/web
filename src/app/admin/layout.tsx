"use client";

import { useEffect, useState, type ReactNode } from "react";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  Users,
  MessageSquare,
  HelpCircle,
  Tag,
  Truck,
  Mail,
  ArrowLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { useUIStore } from "@/store/use-ui-store";

const navItems: { label: string; icon: typeof LayoutDashboard; path: string; description: string }[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin", description: "Overview & insights" },
  { label: "Products", icon: Package, path: "/admin/products", description: "Catalog & inventory" },
  { label: "Orders", icon: ShoppingBag, path: "/admin/orders", description: "Fulfillment queue" },
  { label: "Customers", icon: Users, path: "/admin/customers", description: "User accounts & roles" },
  { label: "Reviews", icon: MessageSquare, path: "/admin/reviews", description: "Moderation queue" },
  { label: "Q&A", icon: HelpCircle, path: "/admin/questions", description: "Customer questions" },
  { label: "Promotions", icon: Tag, path: "/admin/promo-codes", description: "Discount codes" },
  { label: "Shipping", icon: Truck, path: "/admin/shipping", description: "Methods & rates" },
  { label: "Content", icon: FileText, path: "/admin/content", description: "Pages & media" },
  { label: "Newsletter", icon: Mail, path: "/admin/subscribers", description: "Subscribers & emails" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics", description: "Sales & traffic" },
  { label: "Settings", icon: Settings, path: "/admin/settings", description: "Store config" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { filterDrawerOpen, setFilterDrawerOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clear);

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Phase 8 fix: Check auth store FIRST (set by LoginView after login).
  // Only call /api/auth/me if the store is empty (fresh page load / refresh).
  // This fixes the redirect loop: after login, router.push("/admin") preserves
  // the auth store, so we can show admin immediately without an API call.
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      // Step 1: Check if auth store already has a user (from client-side login)
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === "admin") {
        setIsAdmin(true);
        setLoading(false);
        setHydrated(true);
        return;
      }

      // Step 2: Fresh page load — verify via API
      try {
        let res = await fetch("/api/auth/me", { credentials: "include" });

        // Step 3: If 401, try refresh
        if (res.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });

          if (refreshRes.ok) {
            // Refresh succeeded — retry /api/auth/me
            res = await fetch("/api/auth/me", { credentials: "include" });
          }
        }

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === "admin") {
            // Hydrate auth store for other components
            useAuthStore.getState().setUser(data.user);
            setIsAdmin(true);
          } else {
            router.push("/");
          }
        } else {
          // Still 401 after refresh — redirect to login
          router.push("/login?redirect=/admin");
        }
      } catch {
        if (!cancelled) {
          router.push("/login?redirect=/admin");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setHydrated(true);
        }
      }
    }

    checkAuth();
    return () => { cancelled = true; };
  }, [router]);

  if (loading || !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="aura-loader-ring">
          <span className="aura-loader-dot" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const go = (path: string) => {
    router.push(path);
    setFilterDrawerOpen(false);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Header — admin badge + user info */}
      <div className="p-6 border-b border-hairline-cream relative overflow-hidden bg-gradient-gold">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gold/20 rounded-full blur-3xl opacity-60" aria-hidden />
        <div className="relative flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ink to-ink/80 flex items-center justify-center flex-shrink-0 shadow-gold-glow ring-2 ring-gold/30">
            <ShieldCheck size={20} strokeWidth={1.5} className="c-gold" />
          </div>
          <div className="min-w-0">
            <p className="t-label-caps c-gold-deep">Admin Console</p>
            <p className="t-body c-ink font-medium truncate">{user?.firstName} {user?.lastName}</p>
          </div>
        </div>
        <p className="t-caption c-ink-faint relative">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="t-label-caps c-ink-faint px-4 mb-2 mt-2 flex items-center gap-2">
          <span className="w-4 h-px bg-gold/40" aria-hidden />Manage
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path + "/"));
            return (
              <li key={item.path}>
                <button
                  onClick={() => go(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 t-body transition-all duration-300 relative group rounded-sm text-left",
                    isActive ? "c-ink font-medium" : "c-ink-muted hover:c-ink hover:bg-cream/60"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="admin-nav-active"
                      className="absolute inset-0 bg-gold-pale rounded-sm border border-gold/40 shadow-gold-glow"
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="admin-nav-bar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gold rounded-r-full"
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <item.icon
                    size={18}
                    strokeWidth={isActive ? 1.5 : 1.25}
                    className={cn("flex-shrink-0 relative z-10 transition-colors", isActive ? "c-gold-deep" : "group-hover:c-gold")}
                  />
                  <span className="flex-1 relative z-10">{item.label}</span>
                  {isActive && <ChevronRight size={14} strokeWidth={2} className="c-gold-deep relative z-10" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-hairline-cream">
        <button
          onClick={async () => {
            try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* best-effort */ }
            clearAuth();
            router.push("/");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 t-body c-ink-muted hover:c-error transition-colors group rounded-sm hover:bg-error/5"
        >
          <LogOut size={18} strokeWidth={1.25} className="group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>

      {/* Back to store */}
      <div className="p-4 border-t border-hairline-cream">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-3 t-label-caps c-ink-faint hover:c-gold-deep transition-colors group rounded-sm border border-hairline-cream hover:border-hairline-gold"
        >
          <ArrowUpRight size={14} strokeWidth={1.5} className="group-hover:rotate-12 transition-transform" />
          Back to Store
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-aura pt-24 md:pt-28 pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setFilterDrawerOpen(true)}
              className="inline-flex items-center gap-2 t-label-caps c-ink border border-hairline-cream px-4 py-2.5 rounded-sm"
            >
              <Menu size={14} strokeWidth={1.5} />Admin Menu
            </button>
            <div className="flex items-center gap-2 t-caption c-ink-faint">
              <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden />
              Admin mode
            </div>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-[100px] bg-gradient-sidebar border border-hairline-cream shadow-premium overflow-hidden rounded-sm">
              {sidebar}
            </div>
          </aside>

          {/* Mobile drawer */}
          <AnimatePresence>
            {filterDrawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setFilterDrawerOpen(false)}
                  className="fixed inset-0 z-overlay overlay-dark lg:hidden"
                />
                <motion.aside
                  initial={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed top-0 left-0 bottom-0 z-drawer w-full max-w-[360px] bg-paper lg:hidden shadow-modal"
                >
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    aria-label="Close menu"
                    className="absolute top-4 right-4 p-2 c-ink hover:c-gold-deep transition-colors z-10"
                  >
                    <X size={22} strokeWidth={1.25} />
                  </button>
                  {sidebar}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main content */}
          <main className="lg:col-span-9 min-w-0">
            {/* Smart breadcrumbs — context-aware back navigation */}
            <AdminBreadcrumbs pathname={pathname} />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * AdminBreadcrumbs — smart, context-aware breadcrumb navigation.
 *
 * Understands the admin hierarchy and generates the right "back" trail
 * for every page. Examples:
 *
 *   /admin                              → (no breadcrumbs, this is home)
 *   /admin/products                     → Admin Home
 *   /admin/products/new                 → Admin Home › Products
 *   /admin/products/123/edit            → Admin Home › Products
 *   /admin/orders                       → Admin Home
 *   /admin/orders/123                   → Admin Home › Orders
 *   /admin/content/hero-slides          → Admin Home › Content
 *   /admin/content/journal              → Admin Home › Content
 *   /admin/customers/123                → Admin Home › Customers
 *   /admin/settings                     → Admin Home
 */
function AdminBreadcrumbs({ pathname }: { pathname: string }) {
  // Don't show breadcrumbs on the admin dashboard itself
  if (pathname === "/admin") return null;

  // Map path prefixes to their parent section label + URL
  const sections: { prefix: string; label: string; url: string }[] = [
    { prefix: "/admin/products", label: "Products", url: "/admin/products" },
    { prefix: "/admin/orders", label: "Orders", url: "/admin/orders" },
    { prefix: "/admin/customers", label: "Customers", url: "/admin/customers" },
    { prefix: "/admin/reviews", label: "Reviews", url: "/admin/reviews" },
    { prefix: "/admin/questions", label: "Questions", url: "/admin/questions" },
    { prefix: "/admin/subscribers", label: "Subscribers", url: "/admin/subscribers" },
    { prefix: "/admin/newsletter", label: "Newsletter", url: "/admin/newsletter" },
    { prefix: "/admin/analytics", label: "Analytics", url: "/admin/analytics" },
    { prefix: "/admin/promo-codes", label: "Promo Codes", url: "/admin/promo-codes" },
    { prefix: "/admin/flash-sales", label: "Flash Sales", url: "/admin/flash-sales" },
    { prefix: "/admin/shipping", label: "Shipping", url: "/admin/shipping" },
    { prefix: "/admin/settings", label: "Settings", url: "/admin/settings" },
    { prefix: "/admin/content/hero-slides", label: "Hero Slides", url: "/admin/content/hero-slides" },
    { prefix: "/admin/content/brand-values", label: "Brand Values", url: "/admin/content/brand-values" },
    { prefix: "/admin/content/categories", label: "Categories", url: "/admin/content/categories" },
    { prefix: "/admin/content/collections", label: "Collections", url: "/admin/content/collections" },
    { prefix: "/admin/content/journal", label: "Journal", url: "/admin/content/journal" },
    { prefix: "/admin/content/care-guides", label: "Care Guides", url: "/admin/content/care-guides" },
    { prefix: "/admin/content/faq", label: "FAQ", url: "/admin/content/faq" },
    { prefix: "/admin/content/testimonials", label: "Testimonials", url: "/admin/content/testimonials" },
    { prefix: "/admin/content/first-order-offer", label: "First Order Offer", url: "/admin/content/first-order-offer" },
  ];

  // Find the matching section (longest prefix match)
  const match = sections
    .filter((s) => pathname.startsWith(s.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  // Determine the current page label
  let currentLabel = "";
  if (pathname.endsWith("/new")) currentLabel = "New";
  else if (pathname.match(/\/edit$/)) currentLabel = "Edit";
  else if (pathname.match(/\/[^/]+\/[^/]+$/)) currentLabel = "Detail";

  // If no section match (unknown admin page), just show Admin Home
  if (!match) {
    return (
      <div className="mb-6 flex items-center gap-2 t-label-caps c-ink-faint">
        <Link href="/admin" className="inline-flex items-center gap-2 hover:c-gold-deep transition-colors link-underline">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Admin Home
        </Link>
      </div>
    );
  }

  // If we're on a sub-page (new/edit/detail), show: Admin Home › Section Label
  // with a back arrow that goes to the section list
  const isSubPage = pathname !== match.url && currentLabel;

  return (
    <div className="mb-6 flex items-center gap-2 t-label-caps c-ink-faint flex-wrap">
      {/* Back arrow + Admin Home */}
      <Link
        href={isSubPage ? match.url : "/admin"}
        className="inline-flex items-center gap-2 hover:c-gold-deep transition-colors link-underline"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        {isSubPage ? match.label : "Admin Home"}
      </Link>

      {/* If sub-page, also show the breadcrumb trail */}
      {isSubPage && (
        <>
          <ChevronRight size={12} strokeWidth={1.5} className="c-ink-faint opacity-50" />
          <Link href="/admin" className="hover:c-gold-deep transition-colors">
            Admin Home
          </Link>
          <ChevronRight size={12} strokeWidth={1.5} className="c-ink-faint opacity-50" />
          <span className="c-ink">{currentLabel}</span>
        </>
      )}
    </div>
  );
}
