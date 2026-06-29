"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { useAuthStore } from "@/store/use-auth-store";
import { cn } from "@/lib/utils";

const navItems: { label: string; icon: typeof LayoutDashboard; path: string; description: string }[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin", description: "Overview & insights" },
  { label: "Products", icon: Package, path: "/admin/products", description: "Catalog & inventory" },
  { label: "Orders", icon: ShoppingBag, path: "/admin/orders", description: "Fulfillment queue" },
  { label: "Content", icon: FileText, path: "/admin/content", description: "Pages & media" },
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

  // Verify admin access on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        if (data.user?.role !== "admin") {
          router.push("/");
          return;
        }
        setIsAdmin(true);
      })
      .catch(() => {
        router.push("/login?redirect=/admin");
      })
      .finally(() => {
        setLoading(false);
        setHydrated(true);
      });
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

  const initials = `${user?.firstName?.[0] ?? "A"}${user?.lastName?.[0] ?? "D"}`.toUpperCase();

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
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ink to-ink/80 flex items-center justify-center flex-shrink-0 shadow-glow-gold ring-2 ring-gold/30">
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
                      className="absolute inset-0 bg-gold-pale rounded-sm border border-gold/40 shadow-glow-gold"
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
          <main className="lg:col-span-9 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
