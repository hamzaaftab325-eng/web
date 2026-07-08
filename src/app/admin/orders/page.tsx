"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { ShoppingBag, Search, ChevronRight, Calendar, Download } from "lucide-react";

import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { statusConfig } from "@/lib/order-status";
import { formatPrice, cn } from "@/lib/utils";

interface AdminOrder {
  id: string; orderNumber: string; date: string; status: string;
  total: number; email: string; paymentMethod: string; paymentStatus: string;
  itemCount: number;
  customer?: { id: string; name: string; email: string } | null;
}

// statusConfig imported from @/lib/order-status (Phase 3D dedup)

const inputCls = "w-full pl-12 pr-4 py-3 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const fetchOrders = (p: number = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p), limit: "20",
      ...(filter !== "all" && { status: filter }),
      ...(search && { search }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    });
    fetch(`/api/admin/orders?${params}`)
      .then(r => r.ok ? r.json() : { orders: [], total: 0, totalPages: 0 })
      .then(data => {
        setOrders(data.orders ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Phase 7E: Inlined fetchOrders to fix exhaustive-deps warning.
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1", limit: "20",
        ...(filter !== "all" && { status: filter }),
        ...(search && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });
      fetch(`/api/admin/orders?${params}`)
        .then(r => r.ok ? r.json() : { orders: [], total: 0, totalPages: 0 })
        .then(data => {
          setOrders(data.orders ?? []);
          setTotal(data.total ?? 0);
          setTotalPages(data.totalPages ?? 1);
          setPage(1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filter, dateFrom, dateTo]);

  const filters = [
    { key: "all", label: "All", count: total },
    { key: "processing", label: "Processing" },
    { key: "packed", label: "Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />Fulfillment
          </p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Orders</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">{total} order{total === 1 ? "" : "s"} in the system. Track and fulfill customer orders.</p>
        </div>
      </div>

      {/* Search + Date filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none" />
          <input type="text" placeholder="Search by order number or email..." value={search} onChange={e => setSearch(e.target.value)} className={inputCls} />
        </div>
        <button onClick={() => setShowDateFilter(!showDateFilter)} className={cn("inline-flex items-center gap-2 px-4 py-3 t-label-caps border rounded-sm transition-colors flex-shrink-0", showDateFilter ? "bg-ink c-paper border-ink" : "bg-paper c-ink-muted border-hairline-cream hover:border-gold")}>
          <Calendar size={14} /> Date Filter
        </button>
      </div>

      {/* Date range */}
      {showDateFilter && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-3 mb-4">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-4 py-2 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold" />
          <span className="t-caption c-ink-faint">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-4 py-2 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="t-label-caps c-ink-faint hover:c-error transition-colors">Clear</button>
          )}
        </motion.div>
      )}

      {/* Status filters */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream mb-6">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn("px-4 py-2 t-body-sm rounded-full transition-all duration-300 flex items-center gap-2", filter === f.key ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20" : "c-ink-faint hover:c-ink hover:bg-cream/50")}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div>
      ) : orders.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <ShoppingBag size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No orders found</p>
          <p className="t-body c-ink-muted">Try a different search term or filter.</p>
        </div>
      ) : (
        <>
          <RevealOnScroll stagger={0.04} className="space-y-3">
            {orders.map(order => {
              const status = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.processing;
              return (
                <motion.button key={order.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} onClick={() => router.push(`/admin/orders/${order.id}`)} className="group w-full bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 hover:shadow-card-hover transition-shadow text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="t-body c-ink font-medium">{order.orderNumber}</p>
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-pale t-label-caps border border-hairline-gold", status.colorClass)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", status.dotClass)} aria-hidden />{status.label}
                        </span>
                        <span className="t-caption c-ink-faint">{order.itemCount} item{order.itemCount === 1 ? "" : "s"}</span>
                      </div>
                      <p className="t-caption c-ink-faint truncate">
                        {order.customer ? order.customer.name : order.email} · {order.date}
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
                      aria-label="Download invoice"
                    >
                      <Download size={13} strokeWidth={1.5} />
                      <span className="hidden md:inline">Invoice</span>
                    </a>
                    <ChevronRight size={20} strokeWidth={1.25} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </motion.button>
              );
            })}
          </RevealOnScroll>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => fetchOrders(page - 1)} disabled={page <= 1} className="px-4 py-2 t-label-caps c-ink border border-hairline-cream rounded-sm hover:border-gold disabled:opacity-30 disabled:pointer-events-none transition-colors">Previous</button>
              <span className="t-body-sm c-ink-muted px-4">Page {page} of {totalPages}</span>
              <button onClick={() => fetchOrders(page + 1)} disabled={page >= totalPages} className="px-4 py-2 t-label-caps c-ink border border-hairline-cream rounded-sm hover:border-gold disabled:opacity-30 disabled:pointer-events-none transition-colors">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
