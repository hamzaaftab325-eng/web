"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Package, Eye, BarChart3 } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface AnalyticsData {
  sales: Array<{ date: string; revenue: number; orders: number }>;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: Array<{ productName: string; productSlug: string; quantity: number; revenue: number }>;
  totalProducts: number;
  totalPageViews: number;
  searchTerms: Array<{ query: string; results: number }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    fetch(`/api/admin/analytics?range=${range}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  const ranges = [
    { key: "7d", label: "7 Days" },
    { key: "30d", label: "30 Days" },
    { key: "90d", label: "90 Days" },
  ];

  const sales = data?.sales ?? [];
  const topProducts = data?.topProducts ?? [];
  const searchTerms = data?.searchTerms ?? [];
  const maxRevenue = Math.max(...sales.map((s) => s.revenue), 1);

  const cards = [
    {
      label: "Revenue",
      value: loading ? "—" : formatPrice(data?.totalRevenue ?? 0),
      icon: TrendingUp,
      gradient: "from-gold-pale to-cream",
      iconBg: "bg-gold-pale",
      iconColor: "c-gold-deep",
      hint: `Last ${range}`,
    },
    {
      label: "Orders",
      value: loading ? "—" : (data?.totalOrders ?? 0),
      icon: ShoppingBag,
      gradient: "from-cream-deep to-cream",
      iconBg: "bg-cream-deep",
      iconColor: "c-gold-deep",
      hint: `Last ${range}`,
    },
    {
      label: "Avg Order Value",
      value: loading ? "—" : formatPrice(data?.avgOrderValue ?? 0),
      icon: Package,
      gradient: "from-cream to-cream-deep",
      iconBg: "bg-gold-pale",
      iconColor: "c-gold-deep",
      hint: "Per order",
    },
    {
      label: "Page Views",
      value: loading ? "—" : (data?.totalPageViews ?? 0),
      icon: Eye,
      gradient: "from-cream-deep to-gold-pale",
      iconBg: "bg-cream-deep",
      iconColor: "c-gold-deep",
      hint: `Last ${range}`,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Insights
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Analytics</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Revenue trends, top products, and customer search behavior.</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream">
            {ranges.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "px-4 py-2 t-body-sm rounded-full transition-all duration-300",
                  range === r.key
                    ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20"
                    : "c-ink-faint hover:c-ink hover:bg-cream/50"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview cards */}
      <RevealOnScroll stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="group relative border border-hairline-cream p-6 card-modern overflow-hidden rounded-sm"
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100", card.gradient)} aria-hidden />
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-gold/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
              <div className="relative flex items-start justify-between mb-4">
                <div className={cn("w-11 h-11 rounded-full flex items-center justify-center ring-1 ring-hairline-gold", card.iconBg)}>
                  <Icon size={20} strokeWidth={1.25} className={card.iconColor} />
                </div>
              </div>
              <p className="relative t-display-sm c-ink t-num mb-1">{card.value}</p>
              <p className="relative t-label-caps c-ink-faint mb-2">{card.label}</p>
              <p className="relative t-caption c-ink-muted">{card.hint}</p>
            </motion.div>
          );
        })}
      </RevealOnScroll>

      {/* Revenue chart + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Revenue chart */}
        <section>
          <h2 className="t-headline-md c-ink mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-gold" aria-hidden />Revenue
          </h2>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            {loading ? (
              <div className="py-12 text-center">
                <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
              </div>
            ) : sales.length === 0 ? (
              <div className="py-12 text-center">
                <BarChart3 size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
                <p className="t-body c-ink-muted">No sales data yet for this period.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sales.slice(-15).map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="flex items-center gap-3"
                  >
                    <span className="t-caption c-ink-faint w-20 flex-shrink-0">{s.date.slice(5)}</span>
                    <div className="flex-1 h-6 bg-cream rounded-sm overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-gradient-to-r from-gold-pale to-gold rounded-sm"
                      />
                    </div>
                    <span className="t-caption c-ink t-num w-24 text-right flex-shrink-0">{formatPrice(s.revenue)}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Top products */}
        <section>
          <h2 className="t-headline-md c-ink mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-gold" aria-hidden />Top Products
          </h2>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            {loading ? (
              <div className="py-12 text-center">
                <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
              </div>
            ) : topProducts.length === 0 ? (
              <div className="py-12 text-center">
                <Package size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
                <p className="t-body c-ink-muted">No product sales yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-hairline-cream">
                {topProducts.slice(0, 8).map((p, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="t-display-sm c-gold-deep t-num w-8 flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="t-body-sm c-ink truncate">{p.productName}</p>
                      <p className="t-caption c-ink-faint">{p.quantity} sold</p>
                    </div>
                    <p className="t-body-sm c-gold-deep t-num font-medium">{formatPrice(p.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Search terms */}
      <section>
        <h2 className="t-headline-md c-ink mb-4 flex items-center gap-3">
          <span className="w-8 h-px bg-gold" aria-hidden />Top Searches
        </h2>
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
            </div>
          ) : searchTerms.length === 0 ? (
            <div className="py-12 text-center">
              <Eye size={32} strokeWidth={1} className="c-ink-faint mx-auto mb-3" />
              <p className="t-body c-ink-muted">No searches recorded yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {searchTerms.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 chip bg-cream-deep c-ink-muted"
                >
                  {s.query}
                  <span className="t-caption t-num px-1.5 py-0.5 rounded-full bg-gold-pale c-gold-deep">
                    {s.results} results
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
