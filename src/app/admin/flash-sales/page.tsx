"use client";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Sale { id: string; name: string; description: string | null; startDate: string; endDate: string; discountPercent: number | null; promoCode: string | null; isActive: boolean; }
const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => { fetch("/api/admin/flash-sales").then(r => r.ok ? r.json() : { flashSales: [] }).then(d => setItems(d.flashSales ?? [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(null); setSaving(true);
    try { const res = await fetch("/api/admin/flash-sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, discountPercent: Number(discountPercent), promoCode: promoCode || undefined, startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString() }) }); if (!res.ok) throw new Error("Failed"); const data = await res.json(); setItems([data.flashSale, ...items]); setShowForm(false); setName(""); setDescription(""); setDiscountPercent("15"); setPromoCode(""); setStartDate(""); setEndDate(""); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } finally { setSaving(false); }
  };
  const toggleActive = async (id: string, current: boolean) => { await fetch(`/api/admin/flash-sales/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) }); setItems(items.map(i => i.id === id ? { ...i, isActive: !current } : i)); };
  const deleteItem = async (id: string) => { if (!confirm("Delete this flash sale?")) return; await fetch(`/api/admin/flash-sales/${id}`, { method: "DELETE" }); setItems(items.filter(i => i.id !== id)); };

  return (
    <div>
      <div className="mb-10 relative"><div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden /><div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Marketing</p><TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Flash Sales</TextBlurReveal><p className="t-body c-ink-muted max-w-lg">Time-limited discount events with start and end dates.</p></div><button onClick={() => setShowForm(!showForm)} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"><Plus size={16} className={cn("transition-transform", showForm && "rotate-45")} />{showForm ? "Cancel" : "Add Sale"}</button></div></div>
      {showForm && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6"><h2 className="t-headline-sm c-ink mb-4">New Flash Sale</h2>{error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}<form onSubmit={onSubmit} className="space-y-4"><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Sale Name *</span><input required value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Summer Flash Sale" /></label><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Description</span><input value={description} onChange={e => setDescription(e.target.value)} className={inputCls} /></label><div className="grid grid-cols-2 gap-4"><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Discount %</span><input type="number" min="0" max="100" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className={inputCls} /></label><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Promo Code</span><input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} className={inputCls} placeholder="FLASH15" /></label></div><div className="grid grid-cols-2 gap-4"><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Start Date *</span><input required type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} /></label><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">End Date *</span><input required type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} /></label></div><button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">{saving ? "Creating..." : "Create Flash Sale"}</button></form></motion.div>)}
      {loading ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div> : items.length === 0 ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><Zap size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" /><p className="t-headline-sm c-ink mb-2">No flash sales</p><p className="t-body c-ink-muted">Create a time-limited sale to boost revenue.</p></div> : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {items.map(item => {
            const now = new Date(); const start = new Date(item.startDate); const end = new Date(item.endDate);
            const isLive = item.isActive && start <= now && end >= now;
            return (
              <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5">
                <div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1 flex-wrap"><p className={cn("t-body c-ink font-medium", !item.isActive && "opacity-50")}>{item.name}</p>{isLive && <span className="chip bg-success/10 c-success t-label-caps flex items-center gap-1"><Zap size={8} />Live</span>}{item.discountPercent && <span className="chip bg-gold-pale c-gold-deep t-label-caps">{item.discountPercent}% off</span>}{item.promoCode && <span className="chip bg-cream-deep c-ink-faint t-label-caps t-num">{item.promoCode}</span>}</div>{item.description && <p className="t-caption c-ink-muted mb-1">{item.description}</p>}<p className="t-caption c-ink-faint">{start.toLocaleDateString()} — {end.toLocaleDateString()}</p></div><div className="flex items-center gap-1"><button onClick={() => toggleActive(item.id, item.isActive)} className={cn("p-2 t-label-caps rounded-sm transition-all", item.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>{item.isActive ? <EyeOff size={12} /> : <Eye size={12} />}</button><button onClick={() => deleteItem(item.id)} className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all"><Trash2 size={12} /></button></div></div>
              </motion.div>
            );
          })}
        </RevealOnScroll>
      )}
    </div>
  );
}
