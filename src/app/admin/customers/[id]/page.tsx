"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, ShoppingBag, Calendar, ChevronRight, Download } from "lucide-react";

import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { formatPrice, cn } from "@/lib/utils";

interface Customer {
  id: string; email: string; firstName: string; lastName: string;
  phone: string | null; role: string; isActive: boolean;
  createdAt: string; _count?: { orders: number };
}

interface Order {
  id: string; orderNumber: string; status: string; total: number;
  createdAt: string; paymentMethod: string; paymentStatus: string;
  itemCount: number;
}

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  processing: { color: "c-info", dot: "bg-info", label: "Processing" },
  packed: { color: "c-info", dot: "bg-info", label: "Packed" },
  shipped: { color: "c-gold-deep", dot: "bg-gold", label: "Shipped" },
  delivered: { color: "c-success", dot: "bg-success", label: "Delivered" },
  cancelled: { color: "c-error", dot: "bg-error", label: "Cancelled" },
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/admin/customers/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/admin/customers/${id}/orders`).then(r => r.ok ? r.json() : []),
    ]).then(([c, o]) => {
      setCustomer(c);
      setOrders(Array.isArray(o) ? o : (o?.orders ?? []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="aura-loader-ring"><span className="aura-loader-dot" /></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container-aura py-20 text-center">
        <p className="t-body c-ink-muted">Customer not found.</p>
        <Link href="/admin/customers" className="t-label-caps c-gold-deep mt-4 inline-block">← Back to Customers</Link>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const fullName = `${customer.firstName} ${customer.lastName}`;
  const joinDate = new Date(customer.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="container-aura py-10 max-w-5xl">
      {/* Back link */}
      <Link href="/admin/customers" className="inline-flex items-center gap-2 t-label-caps c-ink-faint hover:c-gold-deep transition-colors mb-8">
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Customers
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
        <div className="w-16 h-16 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0">
          <span className="font-display text-2xl c-gold-deep">
            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <TextBlurReveal>
            <h1 className="font-display text-3xl c-ink">{fullName}</h1>
          </TextBlurReveal>
          <div className="flex flex-wrap items-center gap-4 mt-2 t-caption c-ink-faint">
            <span className="inline-flex items-center gap-1.5"><Mail size={13} /> {customer.email}</span>
            {customer.phone && <span className="inline-flex items-center gap-1.5"><Phone size={13} /> {customer.phone}</span>}
            <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> Joined {joinDate}</span>
            {customer.role === "admin" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-pale c-gold-deep rounded-full t-label-caps">Admin</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="bg-paper border border-hairline-cream rounded-sm p-5">
          <p className="t-caption c-ink-faint mb-1">Total Orders</p>
          <p className="font-display text-2xl c-ink t-num">{orders.length}</p>
        </div>
        <div className="bg-paper border border-hairline-cream rounded-sm p-5">
          <p className="t-caption c-ink-faint mb-1">Total Spent</p>
          <p className="font-display text-2xl c-gold-deep t-num">{formatPrice(totalSpent)}</p>
        </div>
        <div className="bg-paper border border-hairline-cream rounded-sm p-5">
          <p className="t-caption c-ink-faint mb-1">Avg Order Value</p>
          <p className="font-display text-2xl c-ink t-num">
            {orders.length > 0 ? formatPrice(totalSpent / orders.length) : "—"}
          </p>
        </div>
      </div>

      {/* Order History */}
      <h2 className="font-display text-xl c-ink mb-4">Order History</h2>
      {orders.length === 0 ? (
        <div className="bg-paper border border-hairline-cream rounded-sm p-10 text-center">
          <ShoppingBag size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
          <p className="t-body c-ink-muted">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const status = statusConfig[order.status] || statusConfig.processing;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <button
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  className="group w-full bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 hover:shadow-card-hover transition-shadow text-left"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="t-body c-ink font-medium font-mono">{order.orderNumber}</p>
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-pale t-label-caps border border-hairline-gold", status.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                          {status.label}
                        </span>
                        <span className="t-caption c-ink-faint">{order.itemCount} item{order.itemCount === 1 ? "" : "s"}</span>
                      </div>
                      <p className="t-caption c-ink-faint">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="t-body c-ink t-num font-medium">{formatPrice(order.total)}</p>
                      <p className="t-caption c-ink-faint capitalize">{order.paymentMethod} · {order.paymentStatus}</p>
                    </div>
                    <a
                      href={`/api/admin/orders/${order.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 t-label-caps c-ink-faint border border-hairline-cream rounded-sm hover:c-gold-deep hover:border-gold transition-colors flex-shrink-0"
                    >
                      <Download size={13} strokeWidth={1.5} />
                      <span className="hidden md:inline">Invoice</span>
                    </a>
                    <ChevronRight size={20} strokeWidth={1.25} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
