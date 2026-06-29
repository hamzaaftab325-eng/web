"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setOrder({ ...order, status });
  };

  if (loading) return <div className="p-8"><div className="aura-loader-ring"><span className="aura-loader-dot" /></div></div>;
  if (!order) return <div className="p-8"><p className="t-body c-ink-faint">Order not found</p></div>;

  const statuses = ["processing", "packed", "shipped", "delivered", "cancelled"];

  return (
    <div className="p-8">
      <h1 className="t-display-md c-ink mb-2">Order {String(order.orderNumber)}</h1>
      <p className="t-body c-ink-muted mb-8">Placed on {String(order.date)}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4">Items</h2>
            <div className="space-y-3">
              {(order.items as Array<Record<string, unknown>>)?.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-hairline-cream last:border-b-0">
                  <p className="t-body c-ink flex-1">{String(item.productName)}</p>
                  <p className="t-body-sm c-ink-muted">Qty: {Number(item.quantity)}</p>
                  <p className="t-body-sm c-ink t-num">{formatPrice(Number(item.price))}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4">Update Status</h2>
            <div className="flex gap-2">
              {statuses.map(s => (
                <button key={s} onClick={() => updateStatus(s)}
                  className={`chip ${order.status === s ? "bg-gold-deep c-paper" : "bg-cream c-ink-muted hover:bg-gold-pale"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4">Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between t-body"><span className="c-ink-muted">Subtotal</span><span className="t-num c-ink">{formatPrice(Number(order.subtotal))}</span></div>
              <div className="flex justify-between t-body"><span className="c-ink-muted">Shipping</span><span className="t-num c-ink">{formatPrice(Number(order.shippingCost))}</span></div>
              <div className="flex justify-between t-body"><span className="c-ink-muted">Discount</span><span className="t-num c-ink">−{formatPrice(Number(order.discount))}</span></div>
              <div className="flex justify-between t-headline-sm pt-2 border-t border-hairline-cream"><span className="c-ink">Total</span><span className="t-num c-gold-deep">{formatPrice(Number(order.total))}</span></div>
            </div>
          </div>

          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4">Customer</h2>
            <p className="t-body c-ink">{String(order.email)}</p>
            <p className="t-body-sm c-ink-muted mt-2">Payment: {String(order.paymentMethod)} / {String(order.paymentStatus)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
