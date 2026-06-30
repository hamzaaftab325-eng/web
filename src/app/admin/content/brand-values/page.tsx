"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface BrandValue { id: string; icon: string; title: string; description: string; sortOrder: number; isActive: boolean; }
const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminBrandValues() {
  const [items, setItems] = useState<BrandValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [icon, setIcon] = useState("Sparkles");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/admin/content/brand-values").then(r => r.ok ? r.json() : { brandValues: [] }).then(d => setItems(d.brandValues ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(null); setSaving(true);
    try {
      const res = await fetch("/api/admin/content/brand-values", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ icon, title, description }) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error ?? "Failed"); }
      const data = await res.json();
      setItems([...items, data.brandValue]); setShowForm(false); setTitle(""); setDescription(""); setIcon("Sparkles");
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/admin/content/brand-values/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) });
    setItems(items.map(i => i.id === id ? { ...i, isActive: !current } : i));
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this brand value?")) return;
    await fetch(`/api/admin/content/brand-values/${id}`, { method: "DELETE" });
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div><p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Brand</p><TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Brand Values</TextBlurReveal><p className="t-body c-ink-muted max-w-lg">The four values shown on the home page — what your atelier stands for.</p></div>
          <button onClick={() => setShowForm(!showForm)} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"><Plus size={16} className={cn("transition-transform", showForm && "rotate-45")} />{showForm ? "Cancel" : "Add Value"}</button>
        </div>
      </div>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <h2 className="t-headline-sm c-ink mb-4">New Brand Value</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Icon (lucide name)</span><input value={icon} onChange={e => setIcon(e.target.value)} className={inputCls} placeholder="Sparkles" /></label>
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Title *</span><input required value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Artisan Crafted" /></label>
              <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Description *</span><input required value={description} onChange={e => setDescription(e.target.value)} className={inputCls} placeholder="Every piece is handcrafted..." /></label>
            </div>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">{saving ? "Creating..." : "Create Value"}</button>
          </form>
        </motion.div>
      )}
      {loading ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div> : items.length === 0 ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><p className="t-body c-ink-muted">No brand values yet.</p></div> : (
        <RevealOnScroll stagger={0.04} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5">
              <div className="flex items-start gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold"><span className="t-label-caps c-gold-deep">{item.icon.slice(0, 2).toUpperCase()}</span></div><div className="flex-1 min-w-0"><p className={cn("t-body c-ink font-medium", !item.isActive && "opacity-50")}>{item.title}</p><p className="t-caption c-ink-faint">{item.icon}</p></div></div>
              <p className="t-body-sm c-ink-muted mb-3">{item.description}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-hairline-cream"><button onClick={() => toggleActive(item.id, item.isActive)} className={cn("inline-flex items-center gap-1 px-3 py-1.5 t-label-caps rounded-sm transition-all", item.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>{item.isActive ? <EyeOff size={10} /> : <Eye size={10} />}{item.isActive ? "Hide" : "Show"}</button><button onClick={() => deleteItem(item.id)} className="p-1.5 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all ml-auto"><Trash2 size={14} /></button></div>
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
