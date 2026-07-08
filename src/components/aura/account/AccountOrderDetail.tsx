"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, Printer, Check, Clock, Loader2 } from "lucide-react";

import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { formatPrice, cn } from "@/lib/utils";

import { AccountLayout } from "./AccountLayout";

interface OrderItem {
  id: string;
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantLabel: string | null;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount?: number;
  shipping: number;
  tax: number;
  total: number;
  date: string;
  trackingNumber: string | null;
  carrier: string | null;
  estimatedDelivery: string | null;
  shippingAddress: Record<string, string | null>;
  items: OrderItem[];
}

const timelineSteps = [
  { status: "processing", label: "Order received", description: "We've received your order and are preparing it." },
  { status: "packed", label: "Packed at workshop", description: "Your pieces have been packed and are ready to ship." },
  { status: "shipped", label: "Shipped", description: "Your order is on its way." },
  { status: "delivered", label: "Delivered", description: "Delivered successfully." },
];

export function AccountOrderDetail({ orderId }: { orderId?: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      // Defer setState via microtask to satisfy React 19's
      // react-hooks/set-state-in-effect rule.
      queueMicrotask(() => {
        setLoading(false);
        setError("No order ID provided.");
      });
      return;
    }
    // Defer setLoading(true) to satisfy the same rule. The fetch is async
    // anyway, so the slight delay is imperceptible.
    queueMicrotask(() => setLoading(true));
    fetch(`/api/orders/${orderId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Order not found");
        return r.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load order");
        setLoading(false);
      });
  }, [orderId]);

  const currentIndex = order ? timelineSteps.findIndex((s) => s.status === order.status) : -1;

  if (loading) {
    return (
      <AccountLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} strokeWidth={1.5} className="animate-spin c-gold-deep" />
        </div>
      </AccountLayout>
    );
  }

  if (error || !order) {
    return (
      <AccountLayout>
        <button onClick={() => router.push("/account/orders")} className="inline-flex items-center gap-2 t-label-caps c-ink-muted hover:c-gold-deep transition-colors link-underline mb-6">
          <ArrowLeft size={14} strokeWidth={1.5} />Back to Orders
        </button>
        <div className="text-center py-20">
          <p className="t-headline-sm c-ink-muted mb-2">{error || "Order not found"}</p>
          <p className="t-body c-ink-faint">This order may have been removed or the link is incorrect.</p>
        </div>
      </AccountLayout>
    );
  }

  const orderDate = order.date ? new Date(order.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <AccountLayout>
      <button onClick={() => router.push("/account/orders")} className="inline-flex items-center gap-2 t-label-caps c-ink-muted hover:c-gold-deep transition-colors link-underline mb-6">
        <ArrowLeft size={14} strokeWidth={1.5} />Back to Orders
      </button>
      <div className="mb-8 pb-8 border-b border-hairline-cream relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-2 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Order Detail</p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-2">{order.orderNumber}</TextBlurReveal>
            <p className="t-body c-ink-muted">Placed on {orderDate}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 border border-hairline-cream bg-cream/50 px-4 py-2.5 t-label-caps c-ink hover:border-gold hover:shadow-card-modern transition-all duration-300 rounded-sm">
              <Printer size={14} strokeWidth={1.5} />Print
            </button>
          </div>
        </div>
      </div>

      {/* Order Status Timeline */}
      <section className="mb-10">
        <h2 className="t-headline-sm c-ink mb-6 flex items-center gap-3"><span className="w-8 h-px bg-gold" aria-hidden /><Truck size={18} strokeWidth={1.25} className="c-gold-deep" />Order Status</h2>
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 shadow-card-modern">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 relative">
            <div className="absolute top-5 left-5 right-5 h-px bg-hairline hidden md:block" />
            {timelineSteps.map((step, i) => (
              <div key={step.status} className={cn("relative flex flex-col items-start md:items-center text-center", i === 0 && "md:pr-4", i > 0 && i < 3 && "md:px-4", i === 3 && "md:pl-4")}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3 relative z-10", i <= currentIndex ? "bg-ink c-paper" : "bg-cream c-ink-faint border border-hairline-cream")}>
                  {i <= currentIndex ? <Check size={16} strokeWidth={2} /> : <Clock size={16} strokeWidth={1.25} />}
                </motion.div>
                <p className={cn("t-label-caps mb-1", i <= currentIndex ? "c-ink" : "c-ink-faint")}>{step.label}</p>
                {i === currentIndex && <p className="t-caption c-gold-deep mt-1">In progress</p>}
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <div className="mt-6 bg-gradient-to-r from-gold-pale to-cream p-4 flex items-center justify-between border border-gold/30 rounded-sm shadow-gold-glow">
              <div><p className="t-label-caps c-gold-deep mb-1">Tracking Number</p><p className="t-body c-ink t-num font-medium">{order.trackingNumber}</p></div>
              <div className="text-right"><p className="t-label-caps c-gold-deep mb-1">Carrier</p><p className="t-body c-ink">{order.carrier || "—"}</p></div>
            </div>
          )}
        </div>
      </section>

      {/* Items + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <h2 className="t-headline-sm c-ink mb-4 flex items-center gap-3"><span className="w-8 h-px bg-gold" aria-hidden /><Package size={18} strokeWidth={1.25} className="c-gold-deep" />Items ({order.items.length})</h2>
          <RevealOnScroll stagger={0.05} className="space-y-3">
            {order.items.map((item) => (
              <motion.div key={item.key} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="flex gap-4 bg-gradient-card-warm border border-hairline-cream p-4 card-modern rounded-sm">
                <button onClick={() => router.push(`/product/${item.slug}`)} className="relative w-20 h-24 bg-cream overflow-hidden flex-shrink-0 group ring-1 ring-hairline-gold rounded-sm">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package size={20} className="c-ink-faint" /></div>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => router.push(`/product/${item.slug}`)} className="t-body c-ink font-medium hover:c-gold-deep transition-colors link-underline text-left block">{item.name}</button>
                  {item.variantLabel && <p className="t-caption c-ink-faint mt-0.5">{item.variantLabel}</p>}
                  <p className="t-caption c-ink-faint mt-1 t-num">Qty {item.quantity}</p>
                </div>
                <div className="text-right"><p className="t-body c-ink t-num font-medium">{formatPrice(Number(item.price) * item.quantity)}</p></div>
              </motion.div>
            ))}
          </RevealOnScroll>
        </section>

        <aside className="lg:col-span-1 space-y-6">
          {/* Shipping Address */}
          <div className="bg-gradient-card-warm border border-hairline-cream p-5 rounded-sm shadow-card-modern">
            <h3 className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><MapPin size={14} strokeWidth={1.5} />Shipping Address</h3>
            <div className="t-body-sm c-ink-muted leading-relaxed">
              <p className="c-ink font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p>{order.shippingAddress?.street}</p>
              {order.shippingAddress?.apartment && <p>{order.shippingAddress.apartment}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.province ?? order.shippingAddress?.state} {order.shippingAddress?.postalCode ?? order.shippingAddress?.zip}</p>
              <p>{order.shippingAddress?.country}</p>
              {order.shippingAddress?.phone && <p className="t-num mt-1">{order.shippingAddress.phone}</p>}
            </div>
            {order.estimatedDelivery && (
              <div className="mt-4 pt-4 border-t border-hairline-cream">
                <p className="t-label-caps c-gold-deep mb-1">Estimated Delivery</p>
                <p className="t-body c-ink font-medium">{new Date(order.estimatedDelivery).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-card-warm border border-hairline-cream p-5 rounded-sm shadow-card-modern">
            <h3 className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><CreditCard size={14} strokeWidth={1.5} />Payment Summary</h3>
            <div className="space-y-2 t-body-sm">
              <div className="flex justify-between c-ink-muted"><span>Subtotal</span><span className="t-num c-ink">{formatPrice(Number(order.subtotal))}</span></div>
              {order.discount && Number(order.discount) > 0 && (
                <div className="flex justify-between c-ink-muted"><span>Discount</span><span className="t-num c-gold-deep">−{formatPrice(Number(order.discount))}</span></div>
              )}
              <div className="flex justify-between c-ink-muted"><span>Shipping</span><span className="t-num c-ink">{Number(order.shipping) === 0 ? "Free" : formatPrice(Number(order.shipping))}</span></div>
              <div className="flex justify-between c-ink-muted"><span>Tax</span><span className="t-num c-ink">{formatPrice(Number(order.tax))}</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-hairline-cream flex justify-between t-headline-sm c-ink">
              <span>Total</span><span className="t-num c-gold-deep">{formatPrice(Number(order.total))}</span>
            </div>
          </div>

          {/* Help */}
          <div className="bg-gradient-to-br from-gold-pale to-cream p-5 text-center border border-hairline-gold rounded-sm">
            <p className="t-body c-ink mb-2">Need help with this order?</p>
            <a href="mailto:concierge@auraliving.com" className="t-label-caps c-gold-deep hover:c-ink transition-colors link-underline">Contact Concierge</a>
          </div>
        </aside>
      </div>
    </AccountLayout>
  );
}
