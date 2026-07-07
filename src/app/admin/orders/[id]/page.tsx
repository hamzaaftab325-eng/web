"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, Download, User, AlertTriangle, Check } from "lucide-react";

import { formatPrice, cn } from "@/lib/utils";
import { statusConfig, statusFlow as sharedStatusFlow } from "@/lib/order-status";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

interface OrderDetail {
  id: string; orderNumber: string; date: string; createdAt: string; updatedAt: string;
  status: string; subtotal: number; shippingCost: number; discount: number; tax: number;
  total: number; email: string; paymentMethod: string; paymentStatus: string;
  trackingNumber?: string; carrier?: string; orderNotes?: string;
  shippingAddress: Record<string, string>;
  items: Array<{ id: string; productName: string; productImage?: string; price: number; quantity: number; variantLabel?: string }>;
  customer?: { id: string; name: string; email: string; phone: string | null } | null;
}

// statusConfig + statusFlow imported from @/lib/order-status (Phase 3D dedup)
// Local statusFlow kept as the legacy "happy path" subset (excludes cancelled/refunded)
const statusFlow = ["processing", "packed", "shipped", "delivered"] as const;

const inputCls = "w-full px-3 py-2 t-body-sm c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(r => (r.ok ? r.json() : null))
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!order || order.status === status) return;
    if (status === "cancelled" && !confirm("Cancel this order? Items will be restocked automatically.")) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) {
        setOrder({ ...order, status, paymentStatus: status === "cancelled" ? "refunded" : order.paymentStatus });
      }
    } catch { /* ignore */ }
    finally { setUpdating(false); }
  };

  const updatePayment = async (paymentStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus }) });
      if (res.ok) setOrder({ ...order, paymentStatus });
    } catch { /* ignore */ }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="p-8"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div>;
  if (!order) return <div className="p-8 text-center"><Package size={40} className="c-ink-faint mx-auto mb-4" /><p className="t-headline-sm c-ink mb-2">Order not found</p><Link href="/admin/orders" className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors mt-4"><ArrowLeft size={14} /> Back to Orders</Link></div>;

  const isCancelled = order.status === "cancelled";
  const currentStepIndex = statusFlow.indexOf(order.status as (typeof statusFlow)[number]);

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 t-label-caps c-ink-faint hover:c-ink mb-6 transition-colors"><ArrowLeft size={14} /> Back to Orders</Link>

      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Order Details</p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-2">{order.orderNumber}</TextBlurReveal>
          <p className="t-body c-ink-muted">Placed on {order.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/api/admin/orders/${id}/invoice`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-cream-deep c-ink t-label-caps px-4 py-3 rounded-sm hover:bg-gold-pale hover:c-gold-deep transition-colors">
            <Download size={14} /> Invoice
          </a>
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Status Timeline</h2>
          <div className="flex items-center gap-2">
            {statusFlow.map((s, i) => {
              const cfg = statusConfig[s as keyof typeof statusConfig] ?? statusConfig.processing;
              const isDone = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center t-caption font-medium transition-colors", isDone ? "bg-success c-paper" : "bg-cream-deep c-ink-faint")}>
                      {isDone && i < currentStepIndex ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                    </div>
                    <span className={cn("t-label-caps", isCurrent ? "c-ink" : isDone ? "c-success" : "c-ink-faint")}>{cfg.label}</span>
                  </div>
                  {i < statusFlow.length - 1 && <div className={cn("h-0.5 flex-1 rounded-full", i < currentStepIndex ? "bg-success" : "bg-hairline")} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: items + status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Items ({order.items.length})</h2>
            <div className="divide-y divide-hairline-cream">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative w-12 h-12 bg-cream border border-hairline-cream overflow-hidden flex-shrink-0 rounded-sm">
                    {item.productImage ? ( 
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />) : (<div className="w-full h-full flex items-center justify-center"><Package size={16} className="c-ink-faint" /></div>)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="t-body c-ink truncate">{item.productName}</p>
                    {item.variantLabel && <p className="t-caption c-ink-faint">{item.variantLabel}</p>}
                  </div>
                  <p className="t-caption c-ink-faint">Qty {item.quantity}</p>
                  <p className="t-body c-ink t-num font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Status update */}
          <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {[...statusFlow, "cancelled"].map(s => {
                const cfg = statusConfig[s as keyof typeof statusConfig] ?? statusConfig.processing;
                const isActive = order.status === s;
                return (
                  <button key={s} onClick={() => updateStatus(s)} disabled={updating || isActive} className={cn("inline-flex items-center gap-1.5 px-4 py-2.5 t-label-caps rounded-sm border transition-all", isActive ? "bg-ink c-paper border-ink" : s === "cancelled" ? "bg-error/10 c-error border-error/20 hover:bg-error hover:c-paper" : "bg-paper c-ink-muted border-hairline-cream hover:border-gold hover:c-gold-deep", updating && "opacity-50 cursor-not-allowed")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-gold" : cfg.dotClass)} aria-hidden />{cfg.label}
                  </button>
                );
              })}
            </div>
            {isCancelled && <p className="t-caption c-error mt-3 flex items-center gap-1"><AlertTriangle size={12} /> Order cancelled — items have been restocked.</p>}

            {/* Tracking info editor */}
            <div className="mt-4 pt-4 border-t border-hairline-cream space-y-3">
              <p className="t-label-caps c-ink-faint">Tracking Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="Tracking number" defaultValue={order.trackingNumber ?? ""} onBlur={async (e) => { const val = e.target.value; if (val !== (order.trackingNumber ?? "")) { const res = await fetch(`/api/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackingNumber: val || null }) }); if (res.ok) { setOrder({ ...order, trackingNumber: val || undefined }); setStatusMsg("Tracking number saved"); setTimeout(() => setStatusMsg(null), 2000); } } }} className={inputCls} />
                <input type="text" placeholder="Carrier (e.g. TCS, DHL)" defaultValue={order.carrier ?? ""} onBlur={async (e) => { const val = e.target.value; if (val !== (order.carrier ?? "")) { const res = await fetch(`/api/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ carrier: val || null }) }); if (res.ok) { setOrder({ ...order, carrier: val || undefined }); setStatusMsg("Carrier saved"); setTimeout(() => setStatusMsg(null), 2000); } } }} className={inputCls} />
              </div>
              {statusMsg && <p className="t-caption c-success flex items-center gap-1"><Check size={12} /> {statusMsg}</p>}
              <p className="t-caption c-ink-faint">Changes save automatically when you click away.</p>
            </div>

            {/* Payment status */}
            <div className="mt-4 pt-4 border-t border-hairline-cream">
              <p className="t-label-caps c-ink-faint mb-2">Payment Status</p>
              <div className="flex gap-2">
                {["pending", "paid", "refunded"].map(ps => (
                  <button key={ps} onClick={() => updatePayment(ps)} disabled={updating || order.paymentStatus === ps} className={cn("px-3 py-1.5 t-label-caps rounded-sm border transition-all capitalize", order.paymentStatus === ps ? "bg-ink c-paper border-ink" : "bg-paper c-ink-muted border-hairline-cream hover:border-gold", updating && "opacity-50")}>{ps}</button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right: summary + customer + address */}
        <div className="space-y-6">
          {/* Summary */}
          <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between t-body"><span className="c-ink-muted">Subtotal</span><span className="t-num c-ink">{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between t-body"><span className="c-ink-muted">Shipping</span><span className="t-num c-ink">{formatPrice(order.shippingCost)}</span></div>
              {order.discount > 0 && <div className="flex justify-between t-body"><span className="c-ink-muted">Discount</span><span className="t-num c-success">−{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between t-headline-sm pt-3 mt-3 border-t border-hairline-cream"><span className="c-ink">Total</span><span className="t-num c-gold-deep">{formatPrice(order.total)}</span></div>
            </div>
          </section>

          {/* Customer */}
          <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Customer</h2>
            {order.customer ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ink to-ink/80 flex items-center justify-center flex-shrink-0">
                    <span className="t-label-caps c-paper">{(order.customer.name || "?").split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase() || "??"}</span>
                  </div>
                  <div>
                    <p className="t-body c-ink font-medium">{order.customer.name}</p>
                    <p className="t-caption c-ink-faint">{order.email}</p>
                  </div>
                </div>
                <Link href={`/admin/customers/${order.customer.id}`} className="inline-flex items-center gap-1.5 t-label-caps c-gold-deep hover:c-ink transition-colors mt-2">
                  <User size={12} /> View Customer Profile
                </Link>
              </>
            ) : (
              <p className="t-body c-ink">{order.email}</p>
            )}
            <div className="mt-3 pt-3 border-t border-hairline-cream">
              <p className="t-label-caps c-ink-faint mb-1">Payment</p>
              <p className="t-body-sm c-ink capitalize">{order.paymentMethod}</p>
              <p className={cn("t-caption capitalize", order.paymentStatus === "paid" ? "c-success" : order.paymentStatus === "refunded" ? "c-error" : "c-gold-deep")}>{order.paymentStatus}</p>
            </div>
          </section>

          {/* Shipping address */}
          {order.shippingAddress && (
            <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
              <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3"><MapPin size={16} className="c-gold-deep" />Shipping Address</h2>
              <div className="t-body-sm c-ink-muted space-y-1">
                <p className="c-ink">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="t-num">{order.shippingAddress.phone}</p>
              </div>
            </section>
          )}

          {/* Order notes */}
          {order.orderNotes && (
            <section className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
              <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3"><span className="w-6 h-px bg-gold" aria-hidden />Order Notes</h2>
              <p className="t-body-sm c-ink-muted">{order.orderNotes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
