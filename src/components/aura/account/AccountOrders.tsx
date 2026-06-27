"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, ArrowRight, ChevronRight } from "lucide-react";
import { AccountLayout } from "./AccountLayout";
import { useUIStore } from "@/store/use-ui-store";
import { formatPrice, cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

const mockOrders = [
  { id: "o1", orderNumber: "AURA-483032", date: "2026-03-22", status: "shipped", total: 472.59, items: [{ key: "k1", image: "/product/arched-floor-mirror.png", name: "Aperture Arched Floor Mirror", quantity: 1 }] },
  { id: "o2", orderNumber: "AURA-482917", date: "2026-03-12", status: "delivered", total: 302.02, items: [{ key: "k2", image: "/product/ceramic-table-lamp.png", name: "Halo Ceramic Table Lamp", quantity: 1 }, { key: "k3", image: "/product/terracotta-ribbed-planter.png", name: "Ribbed Terracotta Planter", quantity: 2 }] },
];

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  processing: { color: "c-info", dot: "bg-info", label: "Processing" },
  packed: { color: "c-info", dot: "bg-info", label: "Packed" },
  shipped: { color: "c-gold-deep", dot: "bg-gold", label: "Shipped" },
  delivered: { color: "c-success", dot: "bg-success", label: "Delivered" },
  cancelled: { color: "c-error", dot: "bg-error", label: "Cancelled" },
};

export function AccountOrders() {
  const { openOrder, setView } = useUIStore();
  const [sort, setSort] = useState<"recent" | "oldest" | "highest">("recent");
  const sorted = [...mockOrders].sort((a, b) => {
    if (sort === "oldest") return a.date.localeCompare(b.date);
    if (sort === "highest") return b.total - a.total;
    return b.date.localeCompare(a.date);
  });

  return (
    <AccountLayout>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div className="relative">
          <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
          <div className="relative">
            <p className="t-label-caps c-gold-deep mb-2 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Order History</p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight">Your Orders</TextBlurReveal>
          </div>
        </div>
        <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream">
          {([{ key: "recent", label: "Recent" }, { key: "oldest", label: "Oldest" }, { key: "highest", label: "Highest" }] as const).map((o) => (
            <button key={o.key} onClick={() => setSort(o.key)} className={cn("px-4 py-2 t-body-sm rounded-full transition-all duration-300", sort === o.key ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20" : "c-ink-faint hover:c-ink hover:bg-cream/50")}>{o.label}</button>
          ))}
        </div>
      </div>
      <RevealOnScroll stagger={0.06} className="space-y-3">
        {sorted.map((order) => {
          const status = statusConfig[order.status] ?? statusConfig.processing!;
          return (
            <motion.button key={order.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} onClick={() => openOrder(order.id)} className="group w-full bg-gradient-card-warm border border-hairline-cream p-5 md:p-6 card-modern text-left rounded-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex -space-x-3">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.key} className="w-14 h-14 bg-cream border-2 border-paper overflow-hidden flex-shrink-0 ring-1 ring-hairline-gold rounded-sm">
                      <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="t-body c-ink font-medium">{order.orderNumber}</p>
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-pale t-label-caps border border-hairline-gold", status.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} aria-hidden />{status.label}
                    </span>
                  </div>
                  <p className="t-caption c-ink-faint">Placed {order.date} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
                </div>
                <div className="flex items-center gap-4 md:flex-col md:items-end">
                  <div className="md:text-right"><p className="t-body c-ink t-num font-medium">{formatPrice(order.total)}</p><p className="t-caption c-ink-faint">Total</p></div>
                  <ChevronRight size={20} strokeWidth={1.25} className="c-ink-faint group-hover:c-gold-deep group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </RevealOnScroll>
    </AccountLayout>
  );
}
