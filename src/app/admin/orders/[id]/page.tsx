import Link from "next/link";

import { ArrowLeft, Package } from "lucide-react";

import { db } from "@/lib/db";
import { statusConfig } from "@/lib/order-status";
import { formatPrice, cn } from "@/lib/utils";

/**
 * Admin Order Detail — Server Component.
 *
 * Phase 4A-2: Converted from "use client" to Server Component.
 * - No loading spinner — order data fetched server-side
 * - Shows full order info: items, shipping address, totals
 * - Status update handled by a small client component
 */
export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!order) {
    return (
      <div className="p-12 text-center">
        <Package size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
        <p className="t-headline-sm c-ink mb-2">Order not found</p>
        <Link href="/admin/orders" className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors mt-4">
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to Orders
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.processing;
  const addr = (order.shippingAddress ?? {}) as Record<string, string>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="t-display-sm c-ink">{order.orderNumber}</h1>
          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-pale t-label-caps border border-hairline-gold", status.colorClass)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", status.dotClass)} aria-hidden />
            {status.label}
          </span>
        </div>
        <p className="t-body c-ink-muted">
          {order.createdAt.toISOString().split("T")[0]} · {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items + Totals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
            <div className="p-5 border-b border-hairline-cream">
              <h2 className="t-headline-sm c-ink">Items</h2>
            </div>
            <div className="divide-y divide-hairline-cream">
              {order.items.map((item) => (
                <div key={item.id} className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-sm overflow-hidden bg-cream border border-hairline-cream flex-shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="c-ink-faint" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="t-body c-ink font-medium">{item.productName}</p>
                    {item.variantLabel && <p className="t-caption c-ink-faint">{item.variantLabel}</p>}
                    <p className="t-caption c-ink-faint">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="t-body c-ink t-num font-medium">{formatPrice(Number(item.price) * item.quantity)}</p>
                    <p className="t-caption c-ink-faint t-num">{formatPrice(Number(item.price))} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 space-y-3">
            <div className="flex justify-between t-body">
              <span className="c-ink-muted">Subtotal</span>
              <span className="t-num c-ink">{formatPrice(Number(order.subtotal))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between t-body">
                <span className="c-ink-muted">Discount</span>
                <span className="t-num c-success">−{formatPrice(Number(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between t-body">
              <span className="c-ink-muted">Shipping</span>
              <span className="t-num c-ink">{Number(order.shippingCost) === 0 ? "Free" : formatPrice(Number(order.shippingCost))}</span>
            </div>
            <div className="flex justify-between t-body">
              <span className="c-ink-muted">Tax</span>
              <span className="t-num c-ink">{formatPrice(Number(order.tax))}</span>
            </div>
            <div className="flex justify-between t-headline-sm pt-3 border-t border-hairline-cream">
              <span className="c-ink">Total</span>
              <span className="t-num c-gold-deep">{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* Customer + Shipping */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5">
            <h2 className="t-label-caps c-ink-faint mb-3">Customer</h2>
            <p className="t-body c-ink font-medium">
              {order.user ? `${order.user.firstName} ${order.user.lastName}` : addr.firstName ?? "Guest"}
            </p>
            <p className="t-caption c-ink-faint">{order.email}</p>
            {order.user && (
              <Link href={`/admin/customers/${order.user.id}`} className="t-label-caps c-gold-deep hover:c-ink transition-colors mt-2 inline-block">
                View customer →
              </Link>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5">
            <h2 className="t-label-caps c-ink-faint mb-3">Shipping Address</h2>
            <div className="t-body-sm c-ink-muted space-y-1">
              <p>{addr.firstName ?? ""} {addr.lastName ?? ""}</p>
              <p>{addr.street ?? ""}</p>
              {addr.apartment && <p>{addr.apartment}</p>}
              <p>{addr.city ?? ""}, {addr.state ?? ""} {addr.zip ?? ""}</p>
              <p>{addr.country ?? ""}</p>
              {addr.phone && <p className="pt-2">Phone: {addr.phone}</p>}
            </div>
          </div>

          {/* Order Notes */}
          {order.orderNotes && (
            <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5">
              <h2 className="t-label-caps c-ink-faint mb-3">Order Notes</h2>
              <p className="t-body-sm c-ink-muted">{order.orderNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
