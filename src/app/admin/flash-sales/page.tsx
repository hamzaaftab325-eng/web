"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, X, Check, Zap, RotateCcw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Sale {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  discountPercent: number | null;
  promoCode: string | null;
  isActive: boolean;
  maxUses: number | null;
  usesCount: number;
}

type SaleStatus = "live" | "scheduled" | "expired" | "exhausted" | "draft";

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

function getSaleStatus(sale: Sale): SaleStatus {
  const now = new Date();
  const start = new Date(sale.startDate);
  const end = new Date(sale.endDate);

  if (sale.maxUses && sale.usesCount >= sale.maxUses) return "exhausted";
  if (!sale.isActive) return "draft";
  if (start > now) return "scheduled";
  if (end < now) return "expired";
  return "live";
}

function UsageBar({ uses, max }: { uses: number; max: number }) {
  const pct = Math.min(Math.round((uses / max) * 100), 100);
  const level = pct >= 90 ? "high" : pct >= 60 ? "mid" : "low";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="t-caption c-ink-faint t-num">{uses} / {max} used</span>
        <span className="t-caption c-ink-faint t-num">{pct}%</span>
      </div>
      <div className="flash-sale-usage-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% used`}>
        <div
          className={cn(
            "flash-sale-usage-bar-fill",
            level === "low" && "flash-sale-usage-bar-fill--low",
            level === "mid" && "flash-sale-usage-bar-fill--mid",
            level === "high" && "flash-sale-usage-bar-fill--high",
          )}
          // Phase 9D: Dynamic percentage width — justified inline style
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SaleStatus }) {
  const config: Record<SaleStatus, { label: string; cls: string }> = {
    live: { label: "Live", cls: "bg-success/10 c-success" },
    scheduled: { label: "Scheduled", cls: "bg-info/10 c-info" },
    expired: { label: "Expired", cls: "bg-cream-deep c-ink-faint" },
    exhausted: { label: "Exhausted", cls: "bg-warning/10 c-warning" },
    draft: { label: "Inactive", cls: "bg-cream-deep c-ink-faint" },
  };
  const { label, cls } = config[status];
  const Icon = status === "live" ? Zap : status === "exhausted" ? AlertTriangle : null;

  return (
    <span className={cn("chip t-label-caps flex items-center gap-1", cls)}>
      {Icon && <Icon size={8} />}
      {label}
    </span>
  );
}

export default function AdminFlashSales() {
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState("15");
  const [promoCode, setPromoCode] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch("/api/admin/flash-sales")
      .then((r) => (r.ok ? r.json() : { flashSales: [] }))
      .then((data) => setItems(data.flashSales ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = useCallback(() => {
    setName(""); setDescription(""); setDiscountPercent("15");
    setPromoCode(""); setMaxUses(""); setStartDate(""); setEndDate("");
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name,
        description: description || undefined,
        discountPercent: discountPercent ? Number(discountPercent) : undefined,
        promoCode: promoCode ? promoCode.toUpperCase() : undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      };

      const res = await fetch("/api/admin/flash-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      const data = await res.json();
      setItems([data.flashSale, ...items]);
      setShowForm(false);
      resetForm();
      toast({ title: "Flash sale created" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast({ title: err.error ?? "Failed to update", variant: "destructive" });
        return;
      }
      setItems(items.map((i) => (i.id === id ? { ...i, isActive: !current } : i)));
      toast({ title: !current ? "Flash sale activated" : "Flash sale deactivated" });
    } catch {
      /* ignore */
    }
  };

  const resetUsage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetUsesCount: true }),
      });
      if (res.ok) {
        setItems(items.map((i) => (i.id === id ? { ...i, usesCount: 0, isActive: true } : i)));
        toast({ title: "Usage counter reset" });
      }
    } catch {
      /* ignore */
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this flash sale? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
        toast({ title: "Flash sale deleted" });
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      {/* Page header — matches promo-codes pattern exactly */}
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Marketing
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Flash Sales</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Time-limited discount events with start/end dates and optional customer limits.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"
          >
            <Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && "rotate-45")} />
            {showForm ? "Cancel" : "Add Sale"}
          </button>
        </div>
      </div>

      {/* Create form — matches promo-codes pattern (grid layout, same inputCls) */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6"
        >
          <h2 className="t-headline-sm c-ink mb-4">New Flash Sale</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Sale Name *</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Summer Flash Sale" maxLength={100} />
            </label>
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Description</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder="Get 15% off everything" maxLength={500} />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Discount %</span>
              <input type="number" min="0" max="100" step="0.01" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Promo Code</span>
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className={inputCls} placeholder="FLASH15" maxLength={50} />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Customer Limit</span>
              <input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className={inputCls} placeholder="Leave empty for unlimited" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Start Date *</span>
              <input required type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">End Date *</span>
              <input required type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
            </label>
            <div className="md:col-span-full flex items-center gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
                {saving ? "Creating..." : "Create Flash Sale"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="t-label-caps c-ink-faint hover:c-ink">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : items.length === 0 ? (
        /* Empty state — matches promo-codes pattern */
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Zap size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No flash sales yet</p>
          <p className="t-body c-ink-muted mb-6">Create a time-limited sale to boost revenue.</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
            <Plus size={14} /> Add Your First Sale
          </button>
        </div>
      ) : (
        /* Sale list — matches promo-codes card pattern */
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {items.map((item) => {
            const status = getSaleStatus(item);
            const usageWarning = item.maxUses && item.usesCount >= item.maxUses * 0.75 && item.usesCount < item.maxUses;
            const isExhausted = status === "exhausted";

            return (
              <motion.div
                key={item.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon */}
                  <div className="relative w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                    <Zap size={20} className="c-gold-deep" />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <p className={cn("t-body c-ink font-medium", !item.isActive && !isExhausted && "opacity-50")}>
                        {item.name}
                      </p>
                      <StatusBadge status={status} />
                      {item.discountPercent && (
                        <span className="chip bg-gold-pale c-gold-deep t-label-caps t-num">
                          {Number(item.discountPercent)}% off
                        </span>
                      )}
                      {item.promoCode && (
                        <span className="chip bg-cream-deep c-ink-faint t-label-caps t-num">
                          {item.promoCode}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="t-caption c-ink-muted mb-1">{item.description}</p>
                    )}

                    <p className="t-caption c-ink-faint">
                      {new Date(item.startDate).toLocaleDateString()} — {new Date(item.endDate).toLocaleDateString()}
                    </p>

                    {/* Usage bar when maxUses is set */}
                    {item.maxUses && (
                      <UsageBar uses={item.usesCount} max={item.maxUses} />
                    )}

                    {/* Warning at 75%+ usage */}
                    {usageWarning && item.maxUses && (
                      <div className="flex items-center gap-2 mt-2 p-2 rounded-sm bg-warning/10">
                        <AlertTriangle size={14} className="c-warning flex-shrink-0" />
                        <p className="t-caption c-warning">
                          {Math.round((item.usesCount / item.maxUses) * 100)}% used — consider increasing the limit
                        </p>
                      </div>
                    )}

                    {/* Exhausted banner with reset */}
                    {isExhausted && (
                      <div className="flex items-center justify-between mt-2 p-2 rounded-sm bg-error/10">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="c-error flex-shrink-0" />
                          <p className="t-caption c-error">Usage limit reached</p>
                        </div>
                        <button
                          onClick={() => resetUsage(item.id)}
                          className="inline-flex items-center gap-1 t-caption c-ink-faint hover:c-gold transition-colors"
                          aria-label="Reset usage counter"
                        >
                          <RotateCcw size={12} />
                          Reset
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions — matches promo-codes pattern */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(item.id, item.isActive)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-2 t-label-caps rounded-sm transition-all",
                        item.isActive
                          ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error"
                          : "bg-success/10 c-success hover:bg-success hover:c-paper"
                      )}
                    >
                      {item.isActive ? <X size={12} /> : <Check size={12} />}
                      {item.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2.5 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all"
                      aria-label="Delete flash sale"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </RevealOnScroll>
      )}
    </div>
  );
}