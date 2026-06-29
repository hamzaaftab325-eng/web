"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Package, Eye } from "lucide-react";

export default function AdminAnalytics() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    fetch(`/api/admin/analytics?range=${range}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div className="p-8"><div className="aura-loader-ring"><span className="aura-loader-dot" /></div></div>;

  const sales = (data?.sales as Array<Record<string, number>>) ?? [];
  const topProducts = (data?.topProducts as Array<Record<string, unknown>>) ?? [];
  const searchTerms = (data?.searchTerms as Array<Record<string, unknown>>) ?? [];

  const maxRevenue = Math.max(...sales.map(s => Number(s.revenue)), 1);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="t-display-md c-ink">Analytics</h1>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`chip ${range === r ? "bg-gold-deep c-paper" : "bg-cream c-ink-muted"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Revenue", value: `₨${Math.round(Number(data?.totalRevenue ?? 0)).toLocaleString()}`, icon: TrendingUp },
          { label: "Orders", value: String(data?.totalOrders ?? 0), icon: ShoppingBag },
          { label: "Avg Order Value", value: `₨${Math.round(Number(data?.avgOrderValue ?? 0)).toLocaleString()}`, icon: Package },
          { label: "Page Views", value: String(data?.totalPageViews ?? 0), icon: Eye },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
              <Icon size={20} className="c-gold-deep mb-3" />
              <p className="t-display-sm c-ink t-num mb-1">{card.value}</p>
              <p className="t-label-caps c-ink-faint">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales chart (CSS bars) */}
        <div>
          <h2 className="t-headline-md c-ink mb-4">Revenue</h2>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            {sales.length === 0 ? (
              <p className="t-body c-ink-faint text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-2">
                {sales.slice(-15).map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="t-caption c-ink-faint w-20">{String(s.date).slice(5)}</span>
                    <div className="flex-1 h-6 bg-cream rounded-sm overflow-hidden">
                      <div className="h-full bg-gold rounded-sm" style={{ width: `${(Number(s.revenue) / maxRevenue) * 100}%` }} />
                    </div>
                    <span className="t-caption c-ink t-num w-20 text-right">₨{Math.round(Number(s.revenue)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top products */}
        <div>
          <h2 className="t-headline-md c-ink mb-4">Top Products</h2>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            {topProducts.length === 0 ? (
              <p className="t-body c-ink-faint text-center py-8">No product sales yet</p>
            ) : (
              <div className="space-y-3">
                {topProducts.slice(0, 8).map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="t-body-sm c-ink flex-1 truncate">{String(p.productName)}</span>
                    <span className="t-body-sm c-ink-muted t-num ml-4">{Number(p.quantity)} sold</span>
                    <span className="t-body-sm c-gold-deep t-num ml-4">₨{Math.round(Number(p.revenue)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search terms */}
        <div>
          <h2 className="t-headline-md c-ink mb-4">Top Searches</h2>
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
            {searchTerms.length === 0 ? (
              <p className="t-body c-ink-faint text-center py-8">No searches yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {searchTerms.map((s, i) => (
                  <span key={i} className="chip bg-cream c-ink-muted">{String(s.query)} ({Number(s.results)})</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
