"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Plus,
  ChevronRight,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: Array<{ id: string; orderNumber: string; date: string; status: string; total: number }>;
  lowStockProducts: Array<{ id: string; name: string; slug: string; stockQuantity: number }>;
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  processing: { color: "c-info", dot: "bg-info", label: "Processing" },
  packed: { color: "c-info", dot: "bg-info", label: "Packed" },
  shipped: { color: "c-gold-deep", dot: "bg-gold", label: "Shipped" },
  delivered: { color: "c-success", dot: "bg-success", label: "Delivered" },
  cancelled: { color: "c-error", dot: "bg-error", label: "Cancelled" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Revenue",
      value: stats ? formatPrice(stats.totalRevenue) : "—",
      icon: TrendingUp,
      hint: "Lifetime gross",
      gradient: "from-gold-pale to-cream",
      iconBg: "bg-gold-pale",
      iconColor: "c-gold-deep",
      action: () => router.push("/admin/analytics"),
      actionLabel: "View analytics",
    },
    {
      label: "Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      hint: "All-time orders",
      gradient: "from-cream-deep to-cream",
      iconBg: "bg-cream-deep",
      iconColor: "c-gold-deep",
      action: () => router.push("/admin/orders"),
      actionLabel: "View orders",
    },
    {
      label: "Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      hint: "Active listings",
      gradient: "from-cream to-cream-deep",
      iconBg: "bg-gold-pale",
      iconColor: "c-gold-deep",
      action: () => router.push("/admin/products"),
      actionLabel: "Manage catalog",
    },
    {
      label: "Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      hint: "Registered users",
      gradient: "from-cream-deep to-gold-pale",
      iconBg: "bg-cream-deep",
      iconColor: "c-gold-deep",
      action: () => router.push("/admin/analytics"),
      actionLabel: "View insights",
    },
  ];

  const quickActions = [
    {
      label: "Add a product",
      description: "Create a new listing with images, pricing, and inventory.",
      icon: Plus,
      href: "/admin/products/new",
      gradient: "from-gold-pale to-cream",
    },
    {
      label: "Fulfill orders",
      description: "Process pending orders and update shipping status.",
      icon: ShoppingBag,
      href: "/admin/orders",
      gradient: "from-cream-deep to-cream",
    },
    {
      label: "Review analytics",
      description: "Track revenue, top products, and customer search terms.",
      icon: TrendingUp,
      href: "/admin/analytics",
      gradient: "from-cream to-cream-deep",
    },
    {
      label: "Edit content",
      description: "Update hero slides, journal articles, and testimonials.",
      icon: Sparkles,
      href: "/admin/content",
      gradient: "from-gold-pale to-cream-deep",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Dashboard
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">
            Welcome back, Admin.
          </TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">
            A quiet overview of your atelier — revenue, orders, inventory, and what needs your attention today.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <RevealOnScroll stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.label}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              onClick={card.action}
              className="group relative border border-hairline-cream p-6 text-left card-modern overflow-hidden rounded-sm"
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100", card.gradient)} aria-hidden />
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-gold/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
              <div className="relative flex items-start justify-between mb-4">
                <div className={cn("w-11 h-11 rounded-full flex items-center justify-center ring-1 ring-hairline-gold", card.iconBg)}>
                  <Icon size={20} strokeWidth={1.25} className={card.iconColor} />
                </div>
                <ArrowRight size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all" />
              </div>
              <p className="relative t-display-sm c-ink t-num mb-1">{loading ? "—" : card.value}</p>
              <p className="relative t-label-caps c-ink-faint mb-2">{card.label}</p>
              <p className="relative t-caption c-ink-muted">{card.hint}</p>
            </motion.button>
          );
        })}
      </RevealOnScroll>

      {/* Recent orders + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Recent Orders */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="t-headline-md c-ink flex items-center gap-3">
              <span className="w-8 h-px bg-gold" aria-hidden />Recent Orders
            </h2>
            <Link href="/admin/orders" className="t-label-caps c-gold-deep hover:c-ink flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
              </div>
            ) : (stats?.recentOrders ?? []).length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
                <p className="t-body c-ink-muted mb-4">No orders yet. When customers place orders, they'll appear here.</p>
                <button onClick={() => router.push("/admin/products")} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-2.5 rounded-sm hover:bg-gold-deep transition-colors">
                  Add Products <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-hairline-cream">
                {(stats?.recentOrders ?? []).map((order, i) => {
                  const status = statusConfig[order.status] ?? statusConfig.processing!;
                  return (
                    <motion.button
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="group w-full p-5 flex items-center gap-4 hover:bg-cream/40 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="t-body c-ink font-medium">{order.orderNumber}</p>
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-pale t-label-caps border border-hairline-gold capitalize", status.color)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} aria-hidden />
                            {status.label}
                          </span>
                        </div>
                        <p className="t-caption c-ink-faint">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="t-body c-ink t-num font-medium">{formatPrice(order.total)}</p>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Low stock alerts */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="t-headline-md c-ink flex items-center gap-3">
              <span className="w-8 h-px bg-gold" aria-hidden />
              <AlertCircle size={20} className="c-gold-deep" />
              Low Stock
            </h2>
            <Link href="/admin/products" className="t-label-caps c-gold-deep hover:c-ink flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
              </div>
            ) : (stats?.lowStockProducts ?? []).length === 0 ? (
              <div className="p-8 text-center">
                <Package size={32} strokeWidth={1} className="c-success mx-auto mb-3" />
                <p className="t-body c-ink-muted">All products are well stocked. Nothing needs attention.</p>
              </div>
            ) : (
              <div className="divide-y divide-hairline-cream">
                {(stats?.lowStockProducts ?? []).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group p-5 flex items-center gap-4 hover:bg-cream/40 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="t-body c-ink font-medium truncate">{product.name}</p>
                      <p className="t-caption c-ink-faint">{product.slug}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("t-body t-num font-medium", product.stockQuantity === 0 ? "c-error" : "c-gold-deep")}>
                        {product.stockQuantity}
                      </p>
                      <p className="t-caption c-ink-faint">in stock</p>
                    </div>
                    <ChevronRight size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="t-headline-md c-ink mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-gold" aria-hidden />Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group relative bg-gradient-to-br p-6 flex items-center gap-4 hover:shadow-card-hover transition-shadow text-left overflow-hidden border border-hairline-cream rounded-sm"
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100", action.gradient)} aria-hidden />
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" aria-hidden />
                <div className="relative w-11 h-11 rounded-full bg-paper flex items-center justify-center ring-1 ring-hairline-gold">
                  <Icon size={20} strokeWidth={1.25} className="c-gold-deep" />
                </div>
                <div className="relative flex-1">
                  <p className="t-headline-sm c-ink mb-1">{action.label}</p>
                  <p className="t-caption c-ink-muted">{action.description}</p>
                </div>
                <ArrowRight size={16} strokeWidth={1.5} className="relative c-ink-faint group-hover:c-gold-deep transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
