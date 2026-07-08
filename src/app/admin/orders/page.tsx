import Link from "next/link";

import { ShoppingBag, ChevronRight } from "lucide-react";

import { db } from "@/lib/db";
import { statusConfig } from "@/lib/order-status";
import { formatPrice, cn } from "@/lib/utils";

/**
 * Admin Orders — Server Component.
 *
 * Phase 4A-2: Converted from "use client" to Server Component.
 * - No loading spinner — data fetched server-side
 * - Initial page load shows all orders instantly
 * - Search/filter can be done client-side via a separate client component if needed
 */
export default async function AdminOrders() {
  const orders = await db.order.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { id: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  const total = await db.order.count();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
          <span className="w-6 h-px bg-gold" aria-hidden />Orders
        </p>
        <h1 className="t-display-sm c-ink leading-tight mb-2">Fulfillment Queue</h1>
        <p className="t-body c-ink-muted">{total} total orders</p>
      </div>

      {/* Orders table */}
      <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
            <p className="t-headline-sm c-ink mb-2">No orders yet</p>
            <p className="t-body c-ink-muted">When customers place orders, they&apos;ll appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-hairline-cream">
            {orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.processing;
              const customerName = order.user
                ? `${order.user.firstName} ${order.user.lastName}`
                : order.email;
              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="group w-full p-5 flex items-center gap-4 hover:bg-cream/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className="t-body c-ink font-medium">{order.orderNumber}</p>
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-pale t-label-caps border border-hairline-gold", status.colorClass)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", status.dotClass)} aria-hidden />
                        {status.label}
                      </span>
                      <span className="t-caption c-ink-faint">{order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
                    </div>
                    <p className="t-caption c-ink-faint truncate">{customerName} · {order.createdAt.toISOString().split("T")[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="t-body c-ink t-num font-medium">{formatPrice(Number(order.total))}</p>
                    <p className="t-caption c-ink-faint">{order.paymentStatus}</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
