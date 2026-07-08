"use client";

import { useState, type ReactNode } from "react";

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

interface AdminUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AdminShellProps {
  user: AdminUser;
  children: ReactNode;
}

const NAV_SECTIONS: {
  title: string;
  items: { label: string; icon: typeof LayoutDashboard; path: string }[];
}[] = [
  {
    title: "Manage",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
      { label: "Products", icon: Package, path: "/admin/products" },
      { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
      { label: "Customers", icon: Users, path: "/admin/customers" },
    ],
  },
  {
    title: "Moderation",
    items: [
      { label: "Reviews", icon: MessageSquare, path: "/admin/reviews" },
      { label: "Q&A", icon: HelpCircle, path: "/admin/questions" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Promotions", icon: Tag, path: "/admin/promo-codes" },
      { label: "Shipping", icon: Truck, path: "/admin/shipping" },
      { label: "Newsletter", icon: Mail, path: "/admin/subscribers" },
    ],
  },
  {
    title: "Content",
    items: [{ label: "Content", icon: FileText, path: "/admin/content" }],
  },
  {
    title: "System",
    items: [
      { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
      { label: "Settings", icon: Settings, path: "/admin/settings" },
    ],
  },
];

export function AdminShell({ user, children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const go = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Best-effort
    }
    window.location.href = "/";
  };

  const isActive = (path: string): boolean => {
    if (path === "/admin") return pathname === "/admin";
    return pathname === path || pathname.startsWith(path + "/");
  };

  const renderNavItem = (item: { label: string; icon: typeof LayoutDashboard; path: string }) => {
    const active = isActive(item.path);
    const Icon = item.icon;
    return (
      <li key={item.path}>
        <button
          onClick={() => go(item.path)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 t-body-sm transition-all duration-200 relative group rounded-sm text-left",
            active
              ? "c-ink font-medium bg-gold-pale"
              : "c-ink-muted hover:c-ink hover:bg-cream/50",
          )}
          aria-current={active ? "page" : undefined}
        >
          {active && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-gold rounded-r-full"
              aria-hidden
            />
          )}
          <Icon
            size={16}
            strokeWidth={active ? 1.75 : 1.25}
            className={cn(
              "flex-shrink-0 transition-colors",
              active ? "c-gold-deep" : "group-hover:c-gold",
            )}
          />
          <span className="flex-1">{item.label}</span>
          {active && <ChevronRight size={12} strokeWidth={2} className="c-gold-deep" />}
        </button>
      </li>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-hairline-cream relative overflow-hidden bg-gradient-gold">
        <div
          className="absolute -top-8 -right-8 w-32 h-32 bg-gold/20 rounded-full blur-3xl opacity-60"
          aria-hidden
        />
        <div className="relative flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ink to-ink/80 flex items-center justify-center flex-shrink-0 shadow-gold-glow ring-2 ring-gold/30">
            <ShieldCheck size={18} strokeWidth={1.5} className="c-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="t-label-caps c-gold-deep">Admin Console</p>
            <p className="t-body-sm c-ink font-medium truncate">
              {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
        <p className="t-caption c-ink-faint relative truncate">{user.email}</p>
      </div>

      <nav
        className="flex-1 p-3 overflow-y-auto aura-scroll"
        aria-label="Admin navigation"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="t-label-caps c-ink-faint px-4 mb-1.5 flex items-center gap-2">
              <span className="w-3 h-px bg-gold/40" aria-hidden />
              {section.title}
            </p>
            <ul className="space-y-0.5">{section.items.map(renderNavItem)}</ul>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-hairline-cream">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 t-body-sm c-ink-muted hover:c-error transition-colors group rounded-sm hover:bg-error/5"
        >
          <LogOut
            size={16}
            strokeWidth={1.25}
            className="group-hover:scale-110 transition-transform"
          />
          Sign Out
        </button>
      </div>

      <div className="p-3 border-t border-hairline-cream">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-2.5 t-label-caps c-ink-faint hover:c-gold-deep transition-colors group rounded-sm border border-hairline-cream hover:border-hairline-gold"
        >
          <ArrowUpRight
            size={13}
            strokeWidth={1.5}
            className="group-hover:rotate-12 transition-transform"
          />
          Back to Store
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-aura pt-24 md:pt-28 pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 t-label-caps c-ink border border-hairline-cream px-4 py-2.5 rounded-sm hover:border-hairline-gold transition-colors"
              aria-label="Open admin menu"
            >
              <Menu size={14} strokeWidth={1.5} />
              Admin Menu
            </button>
            <div className="flex items-center gap-2 t-caption c-ink-faint">
              <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden />
              Admin mode
            </div>
          </div>

          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-[100px] bg-gradient-sidebar border border-hairline-cream shadow-premium overflow-hidden rounded-sm max-h-[calc(100vh-120px)] flex flex-col">
              {sidebarContent}
            </div>
          </aside>

          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setDrawerOpen(false)}
                  className="fixed inset-0 z-overlay overlay-dark lg:hidden"
                  aria-hidden
                />
                <motion.aside
                  initial={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed top-0 left-0 bottom-0 z-drawer w-full max-w-[340px] bg-paper lg:hidden shadow-modal flex flex-col"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Admin navigation"
                >
                  <button
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close admin menu"
                    className="absolute top-4 right-4 p-2 c-ink hover:c-gold-deep transition-colors z-10"
                  >
                    <X size={20} strokeWidth={1.25} />
                  </button>
                  <div className="flex-1 overflow-hidden">{sidebarContent}</div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <main className="lg:col-span-9 min-w-0">
            <AdminBreadcrumbs pathname={pathname} />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function AdminBreadcrumbs({ pathname }: { pathname: string }) {
  if (pathname === "/admin") return null;

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

  const match = sections
    .filter((s) => pathname.startsWith(s.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];

  let currentLabel = "";
  if (pathname.endsWith("/new")) currentLabel = "New";
  else if (pathname.match(/\/edit$/)) currentLabel = "Edit";
  else if (pathname.match(/\/[^/]+\/[^/]+$/)) currentLabel = "Detail";

  if (!match) {
    return (
      <div className="mb-6 flex items-center gap-2 t-label-caps c-ink-faint">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 hover:c-gold-deep transition-colors link-underline"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Admin Home
        </Link>
      </div>
    );
  }

  const isSubPage = pathname !== match.url && currentLabel;

  return (
    <div className="mb-6 flex items-center gap-2 t-label-caps c-ink-faint flex-wrap">
      <Link
        href={isSubPage ? match.url : "/admin"}
        className="inline-flex items-center gap-2 hover:c-gold-deep transition-colors link-underline"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        {isSubPage ? match.label : "Admin Home"}
      </Link>

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

export default AdminShell;
