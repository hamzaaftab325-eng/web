"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Truck, Plus, Trash2, X } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface ShippingMethod {
  id: string; code: string; name: string; description: string | null;
  baseCost: number; freeThreshold: number | null; estimatedDays: string | null;
  isActive: boolean; sortOrder: number;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminShipping() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseCost, setBaseCost] = useState("");
  const [freeThreshold, setFreeThreshold] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");

  useEffect(() => {
    fetch("/api/admin/shipping")
      .then((r) => (r.ok ? r.json() : { shippingMethods: [] }))
      .then((data) => setMethods(data.shippingMethods ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          name,
          description: description || undefined,
          baseCost: Number(baseCost),
          freeThreshold: freeThreshold ? Number(freeThreshold) : null,
          estimatedDays: estimatedDays || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      const data = await res.json();
      setMethods([...methods, data.shippingMethod]);
      setShowForm(false);
      setCode(""); setName(""); setDescription(""); setBaseCost(""); setFreeThreshold(""); setEstimatedDays("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) {
        setMethods(methods.map((m) => (m.id === id ? { ...m, isActive: !current } : m)));
      }
    } catch { /* ignore */ }
  };

  const deleteMethod = async (id: string) => {
    if (!confirm("Delete this shipping method?")) return;
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
      if (res.ok) setMethods(methods.filter((m) => m.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Logistics
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Shipping</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Manage shipping methods, rates, and free-shipping thresholds.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"
          >
            <Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && "rotate-45")} />
            {showForm ? "Cancel" : "Add Method"}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6"
        >
          <h2 className="t-headline-sm c-ink mb-4">New Shipping Method</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Code *</span>
              <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={inputCls} placeholder="STANDARD" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Name *</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Standard Delivery" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Base Cost (PKR) *</span>
              <input required type="number" step="0.01" value={baseCost} onChange={(e) => setBaseCost(e.target.value)} className={inputCls} placeholder="150" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Free Shipping Threshold (PKR)</span>
              <input type="number" value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} className={inputCls} placeholder="5000" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Estimated Days</span>
              <input value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} className={inputCls} placeholder="3-5 business days" />
            </label>
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Description</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
            </label>
            <div className="md:col-span-full flex items-center gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
                {saving ? "Creating..." : "Create Method"}
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
      ) : methods.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Truck size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No shipping methods</p>
          <p className="t-body c-ink-muted mb-6">Add a shipping method so customers can check out.</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
            <Plus size={14} /> Add Shipping Method
          </button>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {methods.map((method) => (
            <motion.div
              key={method.id}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                  <Truck size={20} className="c-gold-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="t-body c-ink font-medium">{method.name}</p>
                    <span className="chip bg-cream-deep c-ink-faint t-label-caps t-num">{method.code}</span>
                    {!method.isActive && <span className="chip bg-error/10 c-error t-label-caps">Inactive</span>}
                  </div>
                  <p className="t-caption c-ink-faint">
                    {formatPrice(method.baseCost)} base
                    {method.freeThreshold && ` · Free over ${formatPrice(method.freeThreshold)}`}
                    {method.estimatedDays && ` · ${method.estimatedDays}`}
                  </p>
                  {method.description && <p className="t-caption c-ink-muted mt-1">{method.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(method.id, method.isActive)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-2 t-label-caps rounded-sm transition-all",
                      method.isActive
                        ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error"
                        : "bg-success/10 c-success hover:bg-success hover:c-paper"
                    )}
                  >
                    {method.isActive ? <X size={12} /> : "Activate"}
                    {method.isActive ? "Deactivate" : ""}
                  </button>
                  <button
                    onClick={() => deleteMethod(method.id)}
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
