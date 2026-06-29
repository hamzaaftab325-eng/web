"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, Trash2, X, Check } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface PromoCode {
  id: string; code: string; type: string; value: number;
  label: string; minOrder: number; maxUses: number | null; usesCount: number;
  expiresAt: string | null; isActive: boolean;
  createdAt: string;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminPromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed" | "shipping">("percent");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");

  useEffect(() => {
    fetch("/api/admin/promo-codes")
      .then((r) => (r.ok ? r.json() : { promoCodes: [] }))
      .then((data) => setCodes(data.promoCodes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          type,
          value: Number(value),
          label,
          minOrder: minOrder ? Number(minOrder) : undefined,
          maxUses: maxUses ? Number(maxUses) : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      const data = await res.json();
      setCodes([data.promoCode, ...codes]);
      setShowForm(false);
      setCode(""); setValue(""); setLabel(""); setMinOrder(""); setMaxUses("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        setCodes(codes.map((c) => (c.id === id ? { ...c, isActive: !current } : c)));
      }
    } catch { /* ignore */ }
  };

  const deleteCode = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
      if (res.ok) setCodes(codes.filter((c) => c.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Marketing
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Promo Codes</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Create discount codes for percentage off, fixed amount, or free shipping.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"
          >
            <Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && "rotate-45")} />
            {showForm ? "Cancel" : "Add Code"}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6"
        >
          <h2 className="t-headline-sm c-ink mb-4">New Promo Code</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Code *</span>
              <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={inputCls} placeholder="SUMMER25" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Type *</span>
              <select value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed" | "shipping")} className={inputCls}>
                <option value="percent">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
                <option value="shipping">Free Shipping</option>
              </select>
            </label>
            {type !== "shipping" && (
              <label className="block">
                <span className="t-label-caps c-ink-faint block mb-1.5">Value * {type === "percent" ? "(%)" : "(PKR)"}</span>
                <input required type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} />
              </label>
            )}
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Min Order (PKR)</span>
              <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Max Uses</span>
              <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className={inputCls} placeholder="Leave empty for unlimited" />
            </label>
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Label *</span>
              <input required value={label} onChange={(e) => setLabel(e.target.value)} className={inputCls} placeholder="Summer sale 25% off" />
            </label>
            <div className="md:col-span-full flex items-center gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
                {saving ? "Creating..." : "Create Code"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="t-label-caps c-ink-faint hover:c-ink">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Tag size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No promo codes yet</p>
          <p className="t-body c-ink-muted mb-6">Create your first discount code to boost sales.</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
            <Plus size={14} /> Add Your First Code
          </button>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {codes.map((promo) => (
            <motion.div
              key={promo.id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                  <Tag size={20} className="c-gold-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="t-body c-ink font-medium t-num">{promo.code}</p>
                    {!promo.isActive && <span className="chip bg-cream-deep c-ink-faint t-label-caps">Inactive</span>}
                    {promo.expiresAt && new Date(promo.expiresAt) < new Date() && <span className="chip bg-error/10 c-error t-label-caps">Expired</span>}
                  </div>
                  <p className="t-caption c-ink-faint">
                    {promo.type === "percent" && `${promo.value}% off`}
                    {promo.type === "fixed" && `${formatPrice(promo.value)} off`}
                    {promo.type === "shipping" && "Free shipping"}
                    {promo.minOrder > 0 && ` · Min order ${formatPrice(promo.minOrder)}`}
                    {promo.maxUses && ` · ${promo.usesCount}/${promo.maxUses} used`}
                  </p>
                  <p className="t-caption c-ink-muted mt-1">{promo.label}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(promo.id, promo.isActive)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-2 t-label-caps rounded-sm transition-all",
                      promo.isActive
                        ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error"
                        : "bg-success/10 c-success hover:bg-success hover:c-paper"
                    )}
                  >
                    {promo.isActive ? <X size={12} /> : <Check size={12} />}
                    {promo.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteCode(promo.id)}
                    className="p-2.5 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
