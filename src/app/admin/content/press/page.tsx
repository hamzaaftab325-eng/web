"use client";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Press { id: string; publication: string; year: string | null; tagline: string | null; quote: string; author: string | null; authorRole: string | null; featureUrl: string | null; sortOrder: number; isActive: boolean; }
const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminPress() {
  const [items, setItems] = useState<Press[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publication, setPublication] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [tagline, setTagline] = useState("");
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [featureUrl, setFeatureUrl] = useState("");

  useEffect(() => { fetch("/api/admin/content/press").then(r => r.ok ? r.json() : { pressFeatures: [] }).then(d => setItems(d.pressFeatures ?? [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(null); setSaving(true);
    try { const res = await fetch("/api/admin/content/press", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publication, year, tagline, quote, author, authorRole, featureUrl: featureUrl || undefined }) }); if (!res.ok) throw new Error("Failed"); const data = await res.json(); setItems([...items, data.pressFeature]); setShowForm(false); setPublication(""); setYear(String(new Date().getFullYear())); setTagline(""); setQuote(""); setAuthor(""); setAuthorRole(""); setFeatureUrl(""); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } finally { setSaving(false); }
  };
  const toggleActive = async (id: string, current: boolean) => { await fetch(`/api/admin/content/press/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) }); setItems(items.map(i => i.id === id ? { ...i, isActive: !current } : i)); };
  const deleteItem = async (id: string) => { if (!confirm("Delete this press feature?")) return; await fetch(`/api/admin/content/press/${id}`, { method: "DELETE" }); setItems(items.filter(i => i.id !== id)); };

  return (
    <div>
      <div className="mb-10 relative"><div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden /><div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Press</p><TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Press Features</TextBlurReveal><p className="t-body c-ink-muted max-w-lg">Press mentions and publications that feature your atelier.</p></div><button onClick={() => setShowForm(!showForm)} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"><Plus size={16} className={cn("transition-transform", showForm && "rotate-45")} />{showForm ? "Cancel" : "Add Feature"}</button></div></div>
      {showForm && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6"><h2 className="t-headline-sm c-ink mb-4">New Press Feature</h2>{error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}<form onSubmit={onSubmit} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Publication *</span><input required value={publication} onChange={e => setPublication(e.target.value)} className={inputCls} placeholder="Dawn Images" /></label><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Year</span><input value={year} onChange={e => setYear(e.target.value)} className={inputCls} placeholder="2025" /></label></div><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Tagline</span><input value={tagline} onChange={e => setTagline(e.target.value)} className={inputCls} placeholder="Home & Design" /></label><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Quote *</span><textarea required value={quote} onChange={e => setQuote(e.target.value)} rows={3} className={inputCls} /></label><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Author</span><input value={author} onChange={e => setAuthor(e.target.value)} className={inputCls} /></label><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Author Role</span><input value={authorRole} onChange={e => setAuthorRole(e.target.value)} className={inputCls} /></label></div><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Feature URL</span><input value={featureUrl} onChange={e => setFeatureUrl(e.target.value)} className={inputCls} placeholder="https://..." /></label><button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">{saving ? "Creating..." : "Create Feature"}</button></form></motion.div>)}
      {loading ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div> : items.length === 0 ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><p className="t-body c-ink-muted">No press features yet.</p></div> : (
        <RevealOnScroll stagger={0.04} className="space-y-3">
          {items.map(item => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5">
              <div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><p className={cn("t-body c-ink font-medium", !item.isActive && "opacity-50")}>{item.publication}</p>{item.year && <span className="t-caption c-ink-faint">{item.year}</span>}{item.tagline && <span className="chip bg-gold-pale c-gold-deep t-label-caps">{item.tagline}</span>}</div><p className="t-body-sm c-ink-muted italic mb-2">&ldquo;{item.quote}&rdquo;</p>{item.author && <p className="t-caption c-ink-faint">{item.author}{item.authorRole && ` — ${item.authorRole}`}</p>}</div><div className="flex items-center gap-1"><button onClick={() => toggleActive(item.id, item.isActive)} className={cn("p-2 t-label-caps rounded-sm transition-all", item.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>{item.isActive ? <EyeOff size={12} /> : <Eye size={12} />}</button><button onClick={() => deleteItem(item.id)} className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all"><Trash2 size={12} /></button></div></div>
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
