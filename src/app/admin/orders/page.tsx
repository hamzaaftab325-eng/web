"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminOrder {
  id: string; orderNumber: string; date: string; status: string;
  total: number; email: string; paymentMethod: string; paymentStatus: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const statuses = ["all", "processing", "packed", "shipped", "delivered", "cancelled"];

  return (
    <div className="p-8">
      <h1 className="t-display-md c-ink mb-8">Orders</h1>

      <div className="flex gap-2 mb-6">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`chip ${filter === s ? "bg-gold-deep c-paper" : "bg-cream c-ink-muted"}`}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline-cream">
              <th className="text-left p-4 t-label-caps c-ink-faint">Order #</th>
              <th className="text-left p-4 t-label-caps c-ink-faint">Date</th>
              <th className="text-left p-4 t-label-caps c-ink-faint">Customer</th>
              <th className="text-left p-4 t-label-caps c-ink-faint">Status</th>
              <th className="text-left p-4 t-label-caps c-ink-faint">Payment</th>
              <th className="text-right p-4 t-label-caps c-ink-faint">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center t-body c-ink-faint">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center t-body c-ink-faint">No orders found</td></tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="border-b border-hairline-cream last:border-b-0 hover:bg-cream/40">
                  <td className="p-4"><Link href={`/admin/orders/${order.id}`} className="t-body-sm c-ink hover:c-gold-deep">{order.orderNumber}</Link></td>
                  <td className="p-4 t-body-sm c-ink-muted">{order.date}</td>
                  <td className="p-4 t-body-sm c-ink-muted">{order.email}</td>
                  <td className="p-4"><span className="chip bg-gold-pale c-gold-deep">{order.status}</span></td>
                  <td className="p-4"><span className="chip bg-cream c-ink-muted">{order.paymentMethod} / {order.paymentStatus}</span></td>
                  <td className="p-4 t-body-sm c-ink t-num text-right">₨{Math.round(order.total).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
