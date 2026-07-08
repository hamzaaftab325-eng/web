import Link from "next/link";

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

import { db } from "@/lib/db";
import { statusConfig } from "@/lib/order-status";
import { formatPrice, cn } from "@/lib/utils";

/**
 * Admin Dashboard — Server Component.
 *
 * Phase 4A-2: Converted from "use client" to Server Component.
 * - No loading spinner — data is fetched server-side before HTML is sent
 * - No useEffect, no useState, no client-side fetch
 * - Page renders instantly with all data populated
 */
export default async function AdminDashboard() {
  // Fetch all dashboard data in parallel
  const [totalProducts, totalOrders, totalRevenue, totalCustomers, recentOrders, lowStockProducts] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.order.count(),
    db.order.aggregate({ _sum: { total: true } }),
    db.user.count({ where: { role: "customer", isActive: true } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: { select: { id: true } },
      },
    }),
    db.product.findMany({
      where: { isActive: true, stockQuantity: { lte: 5 } },
      take: 5,
      orderBy: { stockQuantity: "asc" },
      select: { id: true, name: true, slug: true, stockQuantity: true },
    }),
  ]);

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(Number(totalRevenue._sum.total ?? 0)),
      icon: TrendingUp,
      hint: "Lifetime gross",
      iconBg: "bg-gold-pale",
      href: "/admin/analytics",
      actionLabel: "View analytics",
    },
    {
      label: "Orders",
      value: String(totalOrders),
      icon: ShoppingBag,
      hint: "All-time orders",
      iconBg: "bg-cream-deep",
      href: "/admin/orders",
      actionLabel: "View orders",
    },
    {
      label: "Products",
      value: String(totalProducts),
      icon: Package,
      hint: "Active listings",
      iconBg: "bg-gold-pale",
      href: "/admin/products",
      actionLabel: "Manage catalog",
    },
    {
      label: "Customers",
      value: String(totalCustomers),
      icon: Users,
      hint: "Registered users",
      iconBg: "bg-cream-deep",
      href: "/admin/customers",
      actionLabel: "View customers",
    },
  ];

  const quickActions = [
    {
      label: "Add a product",
      description: "Create a new listing with images, pricing, and inventory.",
      icon: Plus,
      href: "/admin/products/new",
    },
    {
      label: "Fulfill orders",
      description: "Process pending orders and update shipping status.",
      icon: ShoppingBag,
      href: "/admin/orders",
    },
    {
      label: "Review analytics",
      description: "Track revenue, top products, and customer search terms.",
      icon: TrendingUp,
      href: "/admin/analytics",
    },
    {
      label: "Edit content",
      description: "Update hero slides, journal articles, and testimonials.",
      icon: Sparkles,
      href: "/admin/content",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
          <span className="w-6 h-px bg-gold" aria-hidden />Dashboard
        </p>
        <h1 className="t-display-md c-ink leading-tight mb-3">
          Welcome back, Admin.
        </h1>
        <p className="t-body c-ink-muted max-w-lg">
          A quiet overview of your atelier — revenue, orders, inventory, and what needs your attention today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative border border-hairline-cream p-6 text-left card-modern overflow-hidden rounded-sm hover:border-hairline-gold transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-11 h-11 rounded-full flex items-center justify-center ring-1 ring-hairline-gold", card.iconBg)}>
                  <Icon size={20} strokeWidth={1.25} className="c-gold-deep" />
                </div>
                <ArrowRight size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all" />
              </div>
              <p className="t-display-sm c-ink t-num mb-1">{card.value}</p>
              <p className="t-label-caps c-ink-faint mb-2">{card.label}</p>
              <p className="t-caption c-ink-muted">{card.hint}</p>
            </Link>
          );
        })}
      </div>

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
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
                <p className="t-body c-ink-muted mb-4">No orders yet. When customers place orders, they&apos;ll appear here.</p>
                <Link href="/admin/products" className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-2.5 rounded-sm hover:bg-gold-deep transition-colors">
                  Add Products <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-hairline-cream">
                {recentOrders.map((order) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.processing;
                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="group w-full p-5 flex items-center gap-4 hover:bg-cream/40 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="t-body c-ink font-medium">{order.orderNumber}</p>
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-pale t-label-caps border border-hairline-gold capitalize", status.colorClass)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", status.dotClass)} aria-hidden />
                            {status.label}
                          </span>
                        </div>
                        <p className="t-caption c-ink-faint">{order.createdAt.toISOString().split("T")[0]}</p>
                      </div>
                      <div className="text-right">
                        <p className="t-body c-ink t-num font-medium">{formatPrice(Number(order.total))}</p>
                      </div>
                      <ChevronRight size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </Link>
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
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Package size={32} strokeWidth={1} className="c-success mx-auto mb-3" />
                <p className="t-body c-ink-muted">All products are well stocked. Nothing needs attention.</p>
              </div>
            ) : (
              <div className="divide-y divide-hairline-cream">
                {lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}/edit`}
                    className="group p-5 flex items-center gap-4 hover:bg-cream/40 transition-colors"
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
                  </Link>
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
                className="group relative bg-gradient-card-warm p-6 flex items-center gap-4 hover:shadow-card-hover transition-shadow text-left overflow-hidden border border-hairline-cream rounded-sm"
              >
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
