"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, ChevronRight, Package } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface AdminOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  email: string;
  paymentMethod: string;
  paymentStatus: string;
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  processing: { color: "c-info", dot: "bg-info", label: "Processing" },
  packed: { color: "c-info", dot: "bg-info", label: "Packed" },
  shipped: { color: "c-gold-deep", dot: "bg-gold", label: "Shipped" },
  delivered: { color: "c-success", dot: "bg-success", label: "Delivered" },
  cancelled: { color: "c-error", dot: "bg-error", label: "Cancelled" },
};

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const filters = [
    { key: "all", label: "All", count: orders.length },
    { key: "processing", label: "Processing", count: orders.filter((o) => o.status === "processing").length },
    { key: "packed", label: "Packed", count: orders.filter((o) => o.status === "packed").length },
    { key: "shipped", label: "Shipped", count: orders.filter((o) => o.status === "shipped").length },
    { key: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
    { key: "cancelled", label: "Cancelled", count: orders.filter((o) => o.status === "cancelled").length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Fulfillment
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Orders</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">Track and fulfill customer orders — from processing to delivered.</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-4 py-2 t-body-sm rounded-full transition-all duration-300 flex items-center gap-2",
              filter === f.key
                ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20"
                : "c-ink-faint hover:c-ink hover:bg-cream/50"
            )}
          >
            {f.label}
            <span className={cn("t-caption t-num px-1.5 py-0.5 rounded-full", filter === f.key ? "bg-gold c-paper" : "bg-cream-deep")}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <ShoppingBag size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">
            {orders.length === 0 ? "No orders yet" : `No ${filter} orders`}
          </p>
          <p className="t-body c-ink-muted mb-6">
            {orders.length === 0
              ? "When customers place orders, they'll appear here for fulfillment."
              : "Try a different status filter."}
          </p>
          {orders.length === 0 && (
            <button
              onClick={() => router.push("/admin/products")}
              className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors"
            >
              Manage Products <ArrowRight size={14} />
            </button>
          )}
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {filtered.map((order) => {
            const status = statusConfig[order.status] ?? statusConfig.processing!;
            return (
              <motion.button
                key={order.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className="group w-full bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 hover:shadow-card-hover transition-shadow text-left"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="t-body c-ink font-medium">{order.orderNumber}</p>
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-pale t-label-caps border border-hairline-gold", status.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} aria-hidden />
                        {status.label}
                      </span>
                    </div>
                    <p className="t-caption c-ink-faint truncate">
                      {order.email} · {order.date}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="t-body c-ink t-num font-medium">{formatPrice(order.total)}</p>
                    <p className="t-caption c-ink-faint capitalize">{order.paymentMethod} · {order.paymentStatus}</p>
                  </div>
                  <ChevronRight size={20} strokeWidth={1.25} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </RevealOnScroll>
      )}
    </div>
  );
}
