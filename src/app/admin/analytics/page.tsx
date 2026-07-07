"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Download,
  Gem,
  Package,
  Percent,
  Repeat,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn, formatPrice } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { ChartCard, ChartLoading, ChartEmpty, StatusBadge } from "./_components";

/* ── API response shape (mirrors /api/admin/analytics?range=…) ──────────── */

interface AnalyticsData {
  sales: Array<{ date: string; revenue: number; orders: number }>;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: Array<{ productName: string; productSlug: string; quantity: number; revenue: number }>;
  totalProducts: number;
  revenueByCollection: Array<{ name: string; revenue: number }>;
  dayOfWeek: Array<{ day: string; revenue: number; orders: number }>;
  avgCustomerLTV: number;
  repeatPurchaseRate: number;
  totalCustomers: number;
  repeatCustomers: number;
  recentOrders?: Array<{
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    total: number;
    customer?: string;
    email?: string;
    items?: number;
  }>;
}

/* ── Aura palette (hex values for recharts primitives) ──────────────────── */

const AURA = {
  gold: "#D4AF37",
  goldDeep: "#B8901F",
  goldSoft: "#E8C75A",
  goldPale: "#FAF0D4",
  ink: "#1A1714",
  inkMuted: "#6B5D4F",
  inkFaint: "#9B8D7A",
  creamDeep: "#F5EFE1",
} as const;

/** Donut slice palette — gold/ink gradient family, cycled. */
const DONUT_PALETTE = [
  AURA.goldDeep,
  AURA.gold,
  AURA.goldSoft,
  AURA.ink,
  AURA.inkMuted,
  AURA.inkFaint,
  AURA.goldPale,
];

/* ── Chart configs (drive tooltip labels + CSS color vars) ───────────────── */

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: AURA.gold },
  orders: { label: "Orders", color: AURA.ink },
};
const dowConfig: ChartConfig = { revenue: { label: "Revenue", color: AURA.gold } };
const collectionConfig: ChartConfig = { revenue: { label: "Revenue", color: AURA.gold } };

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Compact currency for axis ticks: 5k, 1.2M */
function formatAxisPrice(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${Math.round(n)}`;
}

/** Compact integer for axis ticks: 1.2k, 3.4M */
function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${Math.round(n)}`;
}

/** Short date for axis ticks: "Jul 3". */
function formatAxisDate(iso: string): string {
  const dt = new Date(`${iso}T00:00:00`);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Reorder dayOfWeek (Sun..Sat from API) → Mon..Sun for display. */
function reorderDays(days: AnalyticsData["dayOfWeek"]) {
  const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const byName = Object.fromEntries(days.map((d) => [d.day, d]));
  return order.map(
    (name) => byName[name] ?? { day: name, revenue: 0, orders: 0 },
  );
}

/** Tooltip row: label left, value right. */
function tooltipRow(label: string, valueNode: React.ReactNode) {
  return (
    <div className="flex w-full items-center justify-between gap-3 leading-none">
      <span className="text-muted-foreground capitalize">{label}</span>
      <span className="font-mono font-medium tabular-nums text-foreground">{valueNode}</span>
    </div>
  );
}

/* ── Small presentational sub-components ─────────────────────────────────── */

function SectionHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="w-8 h-px bg-gold" aria-hidden />
      <h2 className="t-headline-md c-ink">{title}</h2>
      {hint && <span className="t-label-caps c-gold-deep ml-auto">{hint}</span>}
    </div>
  );
}

// Phase 5A: ChartCard, ChartLoading, ChartEmpty, StatusBadge extracted to ./_components.tsx

/** Decorative mini area trend used inside KPI cards. */
function Sparkline({
  data,
  dataKey,
  color,
}: {
  data: Array<Record<string, number>>;
  dataKey: string;
  color: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const gradId = `spark-${dataKey}`;
  return (
    <div className="h-10 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive={!prefersReducedMotion}
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */

export default function AdminAnalytics() {
  const prefersReducedMotion = useReducedMotion();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
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

  // Bug #22 fix: convert "7d" → "7 Days" for hint labels
  const rangeLabel = ranges.find(r => r.key === range)?.label ?? range;

  /* Derived, memoized chart datasets ────────────────────────────────────── */

  const sales = useMemo(() => {
    const s = data?.sales ?? [];
    // Show all data points for the selected range (don't slice to 15)
    return [...s].sort((a, b) => a.date.localeCompare(b.date));
  }, [data?.sales]);

  const dow = useMemo(() => reorderDays(data?.dayOfWeek ?? []), [data?.dayOfWeek]);

  const collectionData = useMemo(
    () => (data?.revenueByCollection ?? []).slice(0, 7),
    [data?.revenueByCollection],
  );
  const collectionTotal = useMemo(
    () => collectionData.reduce((s, c) => s + c.revenue, 0),
    [collectionData],
  );

  const topProducts = data?.topProducts ?? [];

  /* Sparkline series for KPI cards ──────────────────────────────────────── */

  const revenueSpark = useMemo(() => sales.map((s) => ({ v: s.revenue })), [sales]);
  const ordersSpark = useMemo(() => sales.map((s) => ({ v: s.orders })), [sales]);
  const aovSpark = useMemo(
    () => sales.map((s) => ({ v: s.orders ? s.revenue / s.orders : 0 })),
    [sales],
  );

  /* Customer insight mini-stats ─────────────────────────────────────────── */

  const customerStats = useMemo(
    () => [
      {
        label: "Total Customers",
        value: loading ? "—" : (data?.totalCustomers ?? 0).toLocaleString(),
        icon: Users,
        hint: "Unique buyers",
      },
      {
        label: "Repeat Customers",
        value: loading ? "—" : (data?.repeatCustomers ?? 0).toLocaleString(),
        icon: Repeat,
        hint: "2+ orders",
      },
      {
        label: "Repeat Rate",
        value: loading ? "—" : `${(data?.repeatPurchaseRate ?? 0).toFixed(1)}%`,
        icon: Percent,
        hint: "Of all customers",
      },
      {
        label: "Avg Customer LTV",
        value: loading ? "—" : formatPrice(data?.avgCustomerLTV ?? 0),
        icon: Gem,
        hint: "Lifetime value",
      },
    ],
    [data, loading],
  );

  /* KPI cards ───────────────────────────────────────────────────────────── */

  const cards = [
    {
      label: "Revenue",
      value: loading ? "—" : formatPrice(data?.totalRevenue ?? 0),
      icon: TrendingUp,
      gradient: "from-gold-pale to-cream",
      iconBg: "bg-gold-pale",
      iconColor: "c-gold-deep",
      hint: `Last ${rangeLabel}`,
      spark: revenueSpark,
      sparkColor: AURA.goldDeep,
    },
    {
      label: "Orders",
      value: loading ? "—" : (data?.totalOrders ?? 0).toLocaleString(),
      icon: ShoppingBag,
      gradient: "from-cream-deep to-cream",
      iconBg: "bg-cream-deep",
      iconColor: "c-gold-deep",
      hint: `Last ${rangeLabel}`,
      spark: ordersSpark,
      sparkColor: AURA.ink,
    },
    {
      label: "Avg Order Value",
      value: loading ? "—" : formatPrice(data?.avgOrderValue ?? 0),
      icon: Package,
      gradient: "from-cream to-cream-deep",
      iconBg: "bg-gold-pale",
      iconColor: "c-gold-deep",
      hint: "Per order",
      spark: aovSpark,
      sparkColor: AURA.goldDeep,
    },
  ];

  /* Export handler — downloads sales CSV from the analytics export API ──── */

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/analytics/export?type=sales&range=${range}`);
      if (!res.ok) throw new Error("Export failed");
      const csv = await res.text();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aura-analytics-sales-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      /* best-effort — fail silently */
    } finally {
      setExporting(false);
    }
  };

  const anim = !prefersReducedMotion;

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-10 relative">
        <div
          className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none"
          aria-hidden
        />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              Insights
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">
              Analytics
            </TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">
              Revenue trends, customer behavior, and product performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date range toggle */}
            <div className="flex items-center gap-1 p-1 bg-gradient-to-r from-cream to-cream-deep rounded-full border border-hairline-cream">
              {ranges.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  aria-pressed={range === r.key}
                  className={cn(
                    "px-4 py-2 t-body-sm rounded-full transition-all duration-300",
                    range === r.key
                      ? "bg-gradient-to-r from-gold-pale to-cream c-gold-deep font-semibold shadow-gold-glow border border-gold/20"
                      : "c-ink-faint hover:c-ink hover:bg-cream/50",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 t-label-caps c-ink hover:c-gold-deep border border-hairline-cream hover:border-hairline-gold rounded-full bg-paper transition-aura disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} strokeWidth={1.5} className={exporting ? "animate-pulse" : ""} />
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Full-page loading state ────────────────────────────────────── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-32"
        >
          <div className="aura-loader-ring aura-loader-lg">
            <span className="aura-loader-dot" />
          </div>
          <p className="mt-6 t-label-caps c-ink-faint">Loading analytics…</p>
        </motion.div>
      )}

      {!loading && (
      <>
      {/* ── Row 1: KPI cards with sparklines ───────────────────────────── */}
      <RevealOnScroll
        stagger={0.08}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="group relative border border-hairline-cream p-6 card-modern overflow-hidden rounded-sm"
            >
              <div
                className={cn("absolute inset-0 bg-gradient-to-br opacity-100", card.gradient)}
                aria-hidden
              />
              <div
                className="absolute -top-8 -right-8 w-24 h-24 bg-gold/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                aria-hidden
              />
              <div className="relative flex items-start justify-between mb-4">
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center ring-1 ring-hairline-gold",
                    card.iconBg,
                  )}
                >
                  <Icon size={20} strokeWidth={1.25} className={card.iconColor} />
                </div>
              </div>
              <p className="relative t-display-sm c-ink t-num mb-1">{card.value}</p>
              <p className="relative t-label-caps c-ink-faint mb-1">{card.label}</p>
              <p className="relative t-caption c-ink-muted mb-3">{card.hint}</p>
              {card.spark && card.spark.length > 1 && (
                <div className="relative -mx-2 -mb-2">
                  <Sparkline data={card.spark} dataKey="v" color={card.sparkColor} />
                </div>
              )}
            </motion.div>
          );
        })}
      </RevealOnScroll>

      {/* ── Row 2: Revenue trend area chart ────────────────────────────── */}
      <RevealOnScroll className="mb-10">
        <SectionHeader title="Revenue Trend" hint={`Last ${rangeLabel}`} />
        <ChartCard>
          {/* Manual legend */}
          <div className="flex items-center gap-5 mb-4">
            <span className="inline-flex items-center gap-2 t-caption c-ink-muted">
              <span className="w-3 h-1 rounded-full" style={{ background: AURA.goldDeep }} />
              Revenue
            </span>
            <span className="inline-flex items-center gap-2 t-caption c-ink-muted">
              <span className="w-3 h-1 rounded-full" style={{ background: AURA.ink }} />
              Orders
            </span>
          </div>
          {loading ? (
            <ChartLoading />
          ) : sales.length === 0 ? (
            <ChartEmpty icon={BarChart3} message="No sales data yet for this period." />
          ) : (
            <ChartContainer config={revenueConfig} className="aspect-auto h-[320px] w-full">
              <AreaChart data={sales} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AURA.gold} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={AURA.gold} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={AURA.goldPale} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatAxisDate}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: AURA.inkFaint, fontSize: 11 }}
                  minTickGap={20}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={formatAxisPrice}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: AURA.inkFaint, fontSize: 11 }}
                  width={48}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={formatCompact}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: AURA.inkFaint, fontSize: 11 }}
                  width={36}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => formatAxisDate(String(label))}
                      formatter={(value, name) =>
                        tooltipRow(
                          String(name),
                          name === "orders"
                            ? Number(value).toLocaleString()
                            : formatPrice(Number(value)),
                        )
                      }
                    />
                  }
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke={AURA.goldDeep}
                  strokeWidth={2}
                  fill="url(#revGrad)"
                  isAnimationActive={anim}
                  animationDuration={900}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke={AURA.ink}
                  strokeWidth={1.5}
                  fill="transparent"
                  isAnimationActive={anim}
                  animationDuration={900}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </ChartCard>
      </RevealOnScroll>

      {/* ── Row 3: Day of week ────────────────────────────────────────── */}
      <RevealOnScroll className="mb-10">
          <SectionHeader title="Revenue by Day of Week" hint="Mon – Sun" />
          <ChartCard>
            {loading ? (
              <ChartLoading />
            ) : dow.every((d) => d.revenue === 0) ? (
              <ChartEmpty icon={BarChart3} message="No revenue recorded yet." />
            ) : (
              <ChartContainer config={dowConfig} className="aspect-auto h-[260px] w-full">
                <BarChart data={dow} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={AURA.goldPale} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(d) => String(d).slice(0, 3)}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: AURA.inkFaint, fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={formatAxisPrice}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: AURA.inkFaint, fontSize: 11 }}
                    width={48}
                  />
                  <ChartTooltip
                    cursor={{ fill: AURA.goldPale, fillOpacity: 0.3 }}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) =>
                          tooltipRow(String(name), formatPrice(Number(value)))
                        }
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill={AURA.gold}
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                    isAnimationActive={anim}
                    animationDuration={800}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </ChartCard>
        </RevealOnScroll>

      {/* ── Row 4: Top products table + Revenue by collection donut ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Top products table */}
        <RevealOnScroll>
          <SectionHeader title="Top Products" hint="By units sold" />
          <ChartCard>
            {loading ? (
              <ChartLoading />
            ) : topProducts.length === 0 ? (
              <ChartEmpty icon={Package} message="No product sales yet." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-hairline-cream">
                      <th className="t-label-caps c-ink-faint text-left py-2 pr-2 w-8">#</th>
                      <th className="t-label-caps c-ink-faint text-left py-2 pr-2">Product</th>
                      <th className="t-label-caps c-ink-faint text-right py-2 pr-2 w-16">Units</th>
                      <th className="t-label-caps c-ink-faint text-right py-2 w-28">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline-cream">
                    {topProducts.slice(0, 8).map((p, i) => (
                      <tr key={p.productSlug ?? i} className="group transition-aura hover:bg-cream/40">
                        <td className="py-3 pr-2 t-num c-gold-deep font-medium">{i + 1}</td>
                        <td className="py-3 pr-2">
                          <p className="t-body-sm c-ink truncate max-w-[200px]">{p.productName}</p>
                        </td>
                        <td className="py-3 pr-2 text-right t-body-sm c-ink-muted t-num">
                          {p.quantity}
                        </td>
                        <td className="py-3 text-right t-body-sm c-gold-deep t-num font-medium">
                          {formatPrice(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </RevealOnScroll>

        {/* Revenue by collection donut */}
        <RevealOnScroll>
          <SectionHeader title="Revenue by Collection" hint="Share of total" />
          <ChartCard>
            {loading ? (
              <ChartLoading />
            ) : collectionData.length === 0 ? (
              <ChartEmpty icon={BarChart3} message="No collection revenue yet." />
            ) : (
              <div>
                <ChartContainer config={collectionConfig} className="aspect-auto h-[220px] w-full">
                  <PieChart>
                    <Pie
                      data={collectionData}
                      dataKey="revenue"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={2}
                      stroke="none"
                      isAnimationActive={anim}
                      animationDuration={900}
                    >
                      {collectionData.map((_, i) => (
                        <Cell key={i} fill={DONUT_PALETTE[i % DONUT_PALETTE.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) =>
                            tooltipRow(String(name), formatPrice(Number(value)))
                          }
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-hairline-cream max-h-40 overflow-y-auto aura-scroll">
                  {collectionData.map((c, i) => {
                    const share = collectionTotal > 0 ? Math.round((c.revenue / collectionTotal) * 100) : 0;
                    return (
                      <div key={c.name} className="flex items-center gap-3 py-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{ background: DONUT_PALETTE[i % DONUT_PALETTE.length] }}
                          aria-hidden
                        />
                        <span className="t-body-sm c-ink flex-1 truncate">{c.name}</span>
                        <span className="t-body-sm c-ink-faint t-num w-10 text-right">{share}%</span>
                        <span className="t-body-sm c-gold-deep t-num w-24 text-right font-medium">
                          {formatPrice(c.revenue)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </ChartCard>
        </RevealOnScroll>
      </div>

      {/* ── Row 5: Customer insights ────────────────────────────────────── */}
        <RevealOnScroll className="mb-10">
          <SectionHeader title="Customer Insights" hint="Loyalty & LTV" />
          <div className="grid grid-cols-2 gap-4">
            {customerStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5 relative overflow-hidden"
                >
                  <div
                    className="absolute -top-6 -right-6 w-16 h-16 bg-gold/5 rounded-full blur-xl"
                    aria-hidden
                  />
                  <div className="relative flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-pale ring-1 ring-hairline-gold">
                      <Icon size={15} strokeWidth={1.5} className="c-gold-deep" />
                    </div>
                    <p className="t-label-caps c-ink-faint">{stat.label}</p>
                  </div>
                  <p className="relative t-display-sm c-ink t-num mb-1">{stat.value}</p>
                  <p className="relative t-caption c-ink-muted">{stat.hint}</p>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

      {/* ── Row 6: Recent Orders table ──────────────────────────────────── */}
      <RevealOnScroll className="mb-10">
        <SectionHeader title="Recent Orders" hint={`Last ${rangeLabel}`} />
        <ChartCard className="p-0 overflow-hidden">
          {loading ? (
            <ChartLoading />
          ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
            <ChartEmpty icon={ShoppingBag} message="No orders in this period yet." />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline-cream">
                    <th className="text-left p-4 t-label-caps c-ink-faint font-semibold">Order</th>
                    <th className="text-left p-4 t-label-caps c-ink-faint font-semibold">Date</th>
                    <th className="text-left p-4 t-label-caps c-ink-faint font-semibold">Customer</th>
                    <th className="text-left p-4 t-label-caps c-ink-faint font-semibold">Status</th>
                    <th className="text-right p-4 t-label-caps c-ink-faint font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.slice(0, 10).map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={anim ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="border-b border-hairline-cream last:border-b-0 hover:bg-cream/50 transition-colors"
                    >
                      <td className="p-4 t-body-sm c-ink font-mono">{order.orderNumber}</td>
                      <td className="p-4 t-body-sm c-ink-muted t-num">{order.date}</td>
                      <td className="p-4 t-body-sm c-ink-muted truncate max-w-[200px]">
                        {order.customer || order.email || "Guest"}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-4 t-body-sm c-ink font-medium text-right t-num">
                        {formatPrice(order.total)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </RevealOnScroll>
      </>
      )}
    </div>
  );
}
