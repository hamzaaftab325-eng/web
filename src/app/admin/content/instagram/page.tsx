"use client";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Post { id: string; imageUrl: string; caption: string | null; productSlug: string | null; instagramUrl: string | null; sortOrder: number; isActive: boolean; }
const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminInstagram() {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  useEffect(() => { fetch("/api/admin/content/instagram").then(r => r.ok ? r.json() : { instagramPosts: [] }).then(d => setItems(d.instagramPosts ?? [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(null); setSaving(true);
    try { const res = await fetch("/api/admin/content/instagram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl, caption }) }); if (!res.ok) throw new Error("Failed"); const data = await res.json(); setItems([...items, data.instagramPost]); setShowForm(false); setImageUrl(""); setCaption(""); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } finally { setSaving(false); }
  };
  const toggleActive = async (id: string, current: boolean) => { await fetch(`/api/admin/content/instagram/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) }); setItems(items.map(i => i.id === id ? { ...i, isActive: !current } : i)); };
  const deleteItem = async (id: string) => { if (!confirm("Delete this post?")) return; await fetch(`/api/admin/content/instagram/${id}`, { method: "DELETE" }); setItems(items.filter(i => i.id !== id)); };

  return (
    <div>
      <div className="mb-10 relative"><div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden /><div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Social</p><TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Instagram Posts</TextBlurReveal><p className="t-body c-ink-muted max-w-lg">Instagram feed shown on the home page.</p></div><button onClick={() => setShowForm(!showForm)} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"><Plus size={16} className={cn("transition-transform", showForm && "rotate-45")} />{showForm ? "Cancel" : "Add Post"}</button></div></div>
      {showForm && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6"><h2 className="t-headline-sm c-ink mb-4">New Instagram Post</h2>{error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}<form onSubmit={onSubmit} className="space-y-4"><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Image URL *</span><input required type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={inputCls} placeholder="https://..." /></label><label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Caption</span><textarea value={caption} onChange={e => setCaption(e.target.value)} rows={2} className={inputCls} /></label><button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">{saving ? "Creating..." : "Create Post"}</button></form></motion.div>)}
      {loading ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div> : items.length === 0 ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><p className="t-body c-ink-muted">No Instagram posts yet.</p></div> : (
        <RevealOnScroll stagger={0.04} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
              <div className="relative aspect-square bg-cream">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.imageUrl} alt={item.caption ?? "Instagram post"} className={cn("w-full h-full object-cover", !item.isActive && "opacity-50")} />{!item.isActive && <div className="absolute top-2 right-2 bg-ink/80 c-paper px-2 py-0.5 rounded-sm t-label-caps flex items-center gap-1"><EyeOff size={8} />Hidden</div>}</div>
              <div className="p-3"><p className="t-caption c-ink-muted line-clamp-2 mb-2">{item.caption ?? "No caption"}</p><div className="flex items-center gap-1"><button onClick={() => toggleActive(item.id, item.isActive)} className={cn("p-1.5 t-label-caps rounded-sm transition-all", item.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>{item.isActive ? <EyeOff size={10} /> : <Eye size={10} />}</button><button onClick={() => deleteItem(item.id)} className="p-1.5 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all ml-auto"><Trash2 size={10} /></button></div></div>
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
