"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, Users, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: Array<{ id: string; orderNumber: string; date: string; status: string; total: number }>;
  lowStockProducts: Array<{ id: string; name: string; slug: string; stockQuantity: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics/overview")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><div className="aura-loader-ring"><span className="aura-loader-dot" /></div></div>;

  const cards = [
    { label: "Total Revenue", value: `₨${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: TrendingUp, color: "c-gold-deep" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "c-ink" },
    { label: "Products", value: stats?.totalProducts ?? 0, icon: Package, color: "c-ink" },
    { label: "Customers", value: stats?.totalCustomers ?? 0, icon: Users, color: "c-ink" },
  ];

  return (
    <div className="p-8">
      <h1 className="t-display-md c-ink mb-8">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon size={24} strokeWidth={1.25} className={card.color} />
              </div>
              <p className="t-display-sm c-ink t-num mb-1">{card.value}</p>
              <p className="t-label-caps c-ink-faint">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="t-headline-md c-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="t-label-caps c-gold-deep hover:c-ink flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
            {(stats?.recentOrders ?? []).length === 0 ? (
              <p className="p-6 t-body c-ink-faint text-center">No orders yet</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline-cream">
                    <th className="text-left p-4 t-label-caps c-ink-faint">Order</th>
                    <th className="text-left p-4 t-label-caps c-ink-faint">Date</th>
                    <th className="text-left p-4 t-label-caps c-ink-faint">Status</th>
                    <th className="text-right p-4 t-label-caps c-ink-faint">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentOrders ?? []).map((order) => (
                    <tr key={order.id} className="border-b border-hairline-cream last:border-b-0">
                      <td className="p-4 t-body-sm c-ink">{order.orderNumber}</td>
                      <td className="p-4 t-body-sm c-ink-muted">{order.date}</td>
                      <td className="p-4"><span className="chip bg-gold-pale c-gold-deep">{order.status}</span></td>
                      <td className="p-4 t-body-sm c-ink t-num text-right">₨{Number(order.total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low stock alerts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="t-headline-md c-ink flex items-center gap-2">
              <AlertCircle size={20} className="c-error" />
              Low Stock
            </h2>
            <Link href="/admin/products" className="t-label-caps c-gold-deep hover:c-ink flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
            {(stats?.lowStockProducts ?? []).length === 0 ? (
              <p className="p-6 t-body c-ink-faint text-center">All products well stocked</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline-cream">
                    <th className="text-left p-4 t-label-caps c-ink-faint">Product</th>
                    <th className="text-right p-4 t-label-caps c-ink-faint">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.lowStockProducts ?? []).map((product) => (
                    <tr key={product.id} className="border-b border-hairline-cream last:border-b-0">
                      <td className="p-4 t-body-sm c-ink">{product.name}</td>
                      <td className="p-4 t-body-sm c-error t-num text-right">{product.stockQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
