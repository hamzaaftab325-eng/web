"use client";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Item { id: string; text: string; sortOrder: number; isActive: boolean; }
const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminBrandMarquee() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => { fetch("/api/admin/content/brand-marquee").then(r => r.ok ? r.json() : { marqueeItems: [] }).then(d => setItems(d.marqueeItems ?? [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  const onSubmit = async (e: FormEvent) => { e.preventDefault(); setSaving(true); try { const res = await fetch("/api/admin/content/brand-marquee", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) }); if (!res.ok) throw new Error("Failed"); const data = await res.json(); setItems([...items, data.marqueeItem]); setShowForm(false); setText(""); } catch {} finally { setSaving(false); } };
  const toggleActive = async (id: string, current: boolean) => { await fetch(`/api/admin/content/brand-marquee/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) }); setItems(items.map(i => i.id === id ? { ...i, isActive: !current } : i)); };
  const deleteItem = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/admin/content/brand-marquee/${id}`, { method: "DELETE" }); setItems(items.filter(i => i.id !== id)); };

  return (
    <div>
      <div className="mb-10 relative"><div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden /><div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Brand</p><TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Brand Marquee</TextBlurReveal><p className="t-body c-ink-muted max-w-lg">Scrolling text marquee shown on the home page.</p></div><button onClick={() => setShowForm(!showForm)} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"><Plus size={16} className={cn("transition-transform", showForm && "rotate-45")} />{showForm ? "Cancel" : "Add Item"}</button></div></div>
      {showForm && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6"><form onSubmit={onSubmit} className="flex gap-3"><input required value={text} onChange={e => setText(e.target.value)} className={inputCls} placeholder="Artisan Crafted" /><button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-2.5 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50 flex-shrink-0">{saving ? "..." : "Add"}</button></form></motion.div>)}
      {loading ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div> : items.length === 0 ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><p className="t-body c-ink-muted">No marquee items yet.</p></div> : (
        <RevealOnScroll stagger={0.04} className="space-y-2">
          {items.map(item => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-4 flex items-center gap-4">
              <p className={cn("t-body c-ink flex-1", !item.isActive && "opacity-50")}>{item.text}</p>
              <button onClick={() => toggleActive(item.id, item.isActive)} className={cn("p-2 t-label-caps rounded-sm transition-all", item.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>{item.isActive ? <EyeOff size={12} /> : <Eye size={12} />}</button>
              <button onClick={() => deleteItem(item.id)} className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all"><Trash2 size={12} /></button>
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
