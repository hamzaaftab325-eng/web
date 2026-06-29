"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, MapPin, CreditCard, Package, ChevronRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

interface OrderDetail {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  email: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string;
  carrier?: string;
  shippingAddress: Record<string, string>;
  items: Array<{ id: string; productName: string; productImage?: string; price: number; quantity: number; variantLabel?: string }>;
}

const statuses = ["processing", "packed", "shipped", "delivered", "cancelled"];

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  processing: { color: "c-info", dot: "bg-info", label: "Processing" },
  packed: { color: "c-info", dot: "bg-info", label: "Packed" },
  shipped: { color: "c-gold-deep", dot: "bg-gold", label: "Shipped" },
  delivered: { color: "c-success", dot: "bg-success", label: "Delivered" },
  cancelled: { color: "c-error", dot: "bg-error", label: "Cancelled" },
};

export default function AdminOrderDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!order || order.status === status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrder({ ...order, status });
      }
    } catch { /* ignore */ }
    finally { setUpdating(false); }
  };

  if (loading) {
    return (
      <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
        <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
        <Package size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
        <p className="t-headline-sm c-ink mb-2">Order not found</p>
        <Link href="/admin/orders" className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors mt-4">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status] ?? statusConfig.processing!;

  return (
    <div>
      {/* Back link */}
      <Link href="/admin/orders" className="inline-flex items-center gap-2 t-label-caps c-ink-faint hover:c-ink mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
          <span className="w-6 h-px bg-gold" aria-hidden />Order Details
        </p>
        <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-2">{order.orderNumber}</TextBlurReveal>
        <p className="t-body c-ink-muted">Placed on {order.date}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: items + status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3">
              <span className="w-6 h-px bg-gold" aria-hidden />Items
            </h2>
            <div className="divide-y divide-hairline-cream">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative w-12 h-12 bg-cream border border-hairline-cream overflow-hidden flex-shrink-0 rounded-sm">
                    {item.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} strokeWidth={1} className="c-ink-faint" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="t-body c-ink truncate">{item.productName}</p>
                    {item.variantLabel && <p className="t-caption c-ink-faint">{item.variantLabel}</p>}
                  </div>
                  <p className="t-caption c-ink-faint">Qty {item.quantity}</p>
                  <p className="t-body c-ink t-num font-medium">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Status update */}
          <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3">
              <span className="w-6 h-px bg-gold" aria-hidden />Update Status
            </h2>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => {
                const cfg = statusConfig[s]!;
                const isActive = order.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={updating || isActive}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-4 py-2.5 t-label-caps rounded-sm border transition-all",
                      isActive
                        ? "bg-ink c-paper border-ink"
                        : "bg-paper c-ink-muted border-hairline-cream hover:border-gold hover:c-gold-deep",
                      updating && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-gold" : cfg.dot)} aria-hidden />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-hairline-cream">
                <p className="t-label-caps c-ink-faint mb-1">Tracking Number</p>
                <p className="t-body c-ink t-num">{order.trackingNumber}</p>
                {order.carrier && <p className="t-caption c-ink-faint mt-1">via {order.carrier}</p>}
              </div>
            )}
          </section>
        </div>

        {/* Right: summary + customer */}
        <div className="space-y-6">
          {/* Summary */}
          <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3">
              <span className="w-6 h-px bg-gold" aria-hidden />Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between t-body">
                <span className="c-ink-muted">Subtotal</span>
                <span className="t-num c-ink">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between t-body">
                <span className="c-ink-muted">Shipping</span>
                <span className="t-num c-ink">{formatPrice(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between t-body">
                  <span className="c-ink-muted">Discount</span>
                  <span className="t-num c-success">−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between t-headline-sm pt-3 mt-3 border-t border-hairline-cream">
                <span className="c-ink">Total</span>
                <span className="t-num c-gold-deep">{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Customer */}
          <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3">
              <span className="w-6 h-px bg-gold" aria-hidden />Customer
            </h2>
            <p className="t-body c-ink">{order.email}</p>
            <div className="mt-3 pt-3 border-t border-hairline-cream">
              <p className="t-label-caps c-ink-faint mb-1">Payment</p>
              <p className="t-body-sm c-ink capitalize">{order.paymentMethod}</p>
              <p className={cn("t-caption capitalize", order.paymentStatus === "paid" ? "c-success" : "c-gold-deep")}>
                {order.paymentStatus}
              </p>
            </div>
          </section>

          {/* Shipping address */}
          {order.shippingAddress && (
            <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
              <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3">
                <MapPin size={16} className="c-gold-deep" />Shipping Address
              </h2>
              <div className="t-body-sm c-ink-muted space-y-1">
                <p className="c-ink">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="t-num">{order.shippingAddress.phone}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
