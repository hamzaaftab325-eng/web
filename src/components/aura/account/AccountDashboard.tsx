"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, MapPin, Heart, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { AccountLayout } from "./AccountLayout";
import { useAuthStore } from "@/store/use-auth-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { formatPrice } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface OrderItem { key: string; image: string; name: string; quantity: number; }
interface Order {
  id: string; orderNumber: string; date: string; status: string; total: number;
  items: OrderItem[];
}

export function AccountDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const wishCount = useWishlistStore((s) => s.slugs.length);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const viewToPath: Record<string, string> = {
    "account-orders": "/account/orders",
    "account-wishlist": "/account/wishlist",
    "account-addresses": "/account/addresses",
    "account-preferences": "/account/preferences",
  };

  const stats = [
    { label: "Orders", value: orders.length, icon: Package, view: "account-orders", hint: orders.length > 0 ? `Last order ${orders[0]?.date ?? ""}` : "No orders yet", gradient: "from-cream-deep to-cream", iconBg: "bg-gold-pale", iconColor: "c-gold-deep" },
    { label: "Wishlist", value: wishCount, icon: Heart, view: "account-wishlist", hint: wishCount > 0 ? `${wishCount} saved pieces` : "No saved pieces", gradient: "from-gold-pale to-cream", iconBg: "bg-cream-deep", iconColor: "c-gold-deep" },
    { label: "Addresses", value: 1, icon: MapPin, view: "account-addresses", hint: "Default: Home", gradient: "from-cream to-cream-deep", iconBg: "bg-gold-pale", iconColor: "c-gold-deep" },
  ];

  return (
    <AccountLayout>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />My Account</p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Welcome back, {user.firstName}.</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">Manage your orders, saved addresses, and wishlist. Your considered home, all in one place.</p>
        </div>
      </div>
      <RevealOnScroll stagger={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {stats.map((stat) => (
          <motion.button key={stat.label} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} onClick={() => router.push(viewToPath[stat.view] ?? "/account")} className="group relative border border-hairline-cream p-6 text-left card-modern overflow-hidden rounded-sm">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-100`} aria-hidden />
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gold/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
            <div className="relative flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-full ${stat.iconBg} flex items-center justify-center ring-1 ring-hairline-gold`}><stat.icon size={20} strokeWidth={1.25} className={stat.iconColor} /></div>
              <ArrowRight size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all" />
            </div>
            <p className="relative t-display-sm c-ink t-num mb-1">{stat.value}</p>
            <p className="relative t-label-caps c-ink-faint mb-2">{stat.label}</p>
            <p className="relative t-caption c-ink-muted">{stat.hint}</p>
          </motion.button>
        ))}
      </RevealOnScroll>
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="t-headline-md c-ink flex items-center gap-3"><span className="w-8 h-px bg-gold" aria-hidden />Recent Orders</h2>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="bg-gradient-card-warm border border-hairline-cream p-8 text-center rounded-sm">
              <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-gradient-card-warm border border-hairline-cream p-8 text-center rounded-sm">
              <Package size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
              <p className="t-body c-ink-muted mb-4">No orders yet. When you place your first order, it will appear here.</p>
              <button onClick={() => router.push("/shop")} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
                Browse the Shop <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            orders.slice(0, 5).map((order, i) => (
              <motion.button key={order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }} onClick={() => router.push(`/account/orders/${order.id}`)} className="group w-full bg-gradient-card-warm border border-hairline-cream p-5 flex items-center gap-4 card-modern text-left rounded-sm">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.key} className="relative w-12 h-12 bg-cream border-2 border-paper overflow-hidden flex-shrink-0 ring-1 ring-hairline-gold rounded-sm">
                      {item.image ? <Image src={item.image} alt="" fill sizes="48px" className="object-cover" /> : <div className="w-full h-full bg-cream" />}
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="t-body c-ink font-medium">{order.orderNumber}</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-pale t-label-caps c-gold-deep border border-hairline-gold capitalize"><span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden />{order.status}</span>
                  </div>
                  <p className="t-caption c-ink-faint">{order.date} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
                </div>
                <div className="text-right"><p className="t-body c-ink t-num font-medium">{formatPrice(order.total)}</p></div>
                <ArrowRight size={16} strokeWidth={1.5} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.button>
            ))
          )}
        </div>
      </section>
      <section>
        <h2 className="t-headline-md c-ink mb-6 flex items-center gap-3"><span className="w-8 h-px bg-gold" aria-hidden />Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => router.push("/account/preferences")} className="group relative bg-gradient-to-br from-gold-pale to-cream p-6 flex items-center gap-4 hover:shadow-card-hover transition-shadow text-left overflow-hidden border border-hairline-gold rounded-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" aria-hidden />
            <div className="relative w-11 h-11 rounded-full bg-paper flex items-center justify-center ring-1 ring-hairline-gold"><Sparkles size={20} strokeWidth={1.25} className="c-gold-deep" /></div>
            <div className="relative flex-1"><p className="t-headline-sm c-ink mb-1">Update preferences</p><p className="t-caption c-ink-muted">Newsletter, style, room, budget, currency</p></div>
            <ArrowRight size={16} strokeWidth={1.5} className="relative c-ink-faint group-hover:c-gold-deep transition-colors" />
          </button>
          <button onClick={() => router.push("/shop")} className="group relative bg-gradient-to-br from-cream-deep to-cream p-6 flex items-center gap-4 hover:shadow-card-hover transition-shadow text-left overflow-hidden border border-hairline-cream rounded-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" aria-hidden />
            <div className="relative w-11 h-11 rounded-full bg-paper flex items-center justify-center ring-1 ring-hairline-cream"><TrendingUp size={20} strokeWidth={1.25} className="c-ink" /></div>
            <div className="relative flex-1"><p className="t-headline-sm c-ink mb-1">Continue browsing</p><p className="t-caption c-ink-muted">Pick up where you left off in the shop</p></div>
            <ArrowRight size={16} strokeWidth={1.5} className="relative c-ink-faint group-hover:c-gold-deep transition-colors" />
          </button>
        </div>
      </section>
    </AccountLayout>
  );
}
