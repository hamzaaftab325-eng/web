"use client";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff, Upload, X, Pencil, ArrowUp, ArrowDown } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  useEffect(() => { fetch("/api/admin/content/instagram").then(r => r.ok ? r.json() : { instagramPosts: [] }).then(d => setItems(d.instagramPosts ?? [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("folder", "aura-living/instagram");
      formData.append("context", "instagram-post");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      const data = await res.json();
      setImageUrl(data.fullUrl ?? data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setImageUrl(""); setCaption(""); setProductSlug(""); setInstagramUrl("");
    setEditingId(null);
  };

  const startEdit = (item: Post) => {
    setEditingId(item.id);
    setImageUrl(item.imageUrl);
    setCaption(item.caption ?? "");
    setProductSlug(item.productSlug ?? "");
    setInstagramUrl(item.instagramUrl ?? "");
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => { setShowForm(false); resetForm(); };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(null); setSaving(true);
    try {
      const isEditing = !!editingId;
      const url = isEditing ? `/api/admin/content/instagram/${editingId}` : "/api/admin/content/instagram";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          caption: caption || undefined,
          productSlug: productSlug || undefined,
          instagramUrl: instagramUrl || undefined,
        }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error ?? "Failed"); }
      const data = await res.json();
      const returned = data.instagramPost;
      if (isEditing) setItems(items.map(i => i.id === editingId ? returned : i));
      else setItems([...items, returned]);
      cancelForm();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); } finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => { await fetch(`/api/admin/content/instagram/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) }); setItems(items.map(i => i.id === id ? { ...i, isActive: !current } : i)); };
  const deleteItem = async (id: string) => { if (!confirm("Delete this post?")) return; await fetch(`/api/admin/content/instagram/${id}`, { method: "DELETE" }); setItems(items.filter(i => i.id !== id)); };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/admin/content/instagram/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/admin/content/instagram/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    setItems((prev) => prev.map((s) => {
      if (s.id === a.id) return { ...s, sortOrder: b.sortOrder };
      if (s.id === b.id) return { ...s, sortOrder: a.sortOrder };
      return s;
    }));
  };

  const isEditing = !!editingId;

  return (
    <div>
      <div className="mb-10 relative"><div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden /><div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4"><div><p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Social</p><TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Instagram Posts</TextBlurReveal><p className="t-body c-ink-muted max-w-lg">Instagram feed shown on the home page.</p></div><button onClick={() => { if (isEditing) cancelForm(); else { resetForm(); setShowForm(!showForm); } }} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0"><Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && !isEditing && "rotate-45")} />{showForm ? (isEditing ? "Cancel Edit" : "Cancel") : "Add Post"}</button></div></div>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <h2 className="t-headline-sm c-ink mb-4">{isEditing ? "Edit Instagram Post" : "New Instagram Post"}</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Image *</span>
              {imageUrl ? (
                <div className="relative inline-block">
                  { }
                  <img src={imageUrl} alt="Instagram preview" className="w-full max-w-md aspect-square object-cover border border-hairline-cream rounded-sm" />
                  <button type="button" onClick={() => setImageUrl("")} className="absolute -top-2 -right-2 bg-ink c-paper p-1 rounded-full hover:bg-error transition-colors"><X size={12} /></button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-2.5 rounded-sm cursor-pointer hover:bg-gold-deep transition-colors">
                  <Upload size={14} />
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
                </label>
              )}
            </div>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Caption</span><textarea value={caption} onChange={e => setCaption(e.target.value)} rows={2} className={inputCls} /></label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Product Slug (optional)</span><input value={productSlug} onChange={e => setProductSlug(e.target.value)} className={inputCls} placeholder="halo-ceramic-lamp" /></label>
            <label className="block"><span className="t-label-caps c-ink-faint block mb-1.5">Instagram URL (optional)</span><input type="url" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className={inputCls} placeholder="https://instagram.com/p/..." /></label>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving || !imageUrl} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">{saving ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Post")}</button>
              <button type="button" onClick={cancelForm} className="t-label-caps c-ink-faint hover:c-ink">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}
      {loading ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div> : items.length === 0 ? <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center"><p className="t-body c-ink-muted">No Instagram posts yet.</p></div> : (
        <RevealOnScroll stagger={0.04} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...items].sort((a, b) => a.sortOrder - b.sortOrder).map((item, idx, arr) => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
              <div className="relative aspect-square bg-cream">{ }<img src={item.imageUrl} alt={item.caption ?? "Instagram post"} className={cn("w-full h-full object-cover", !item.isActive && "opacity-50")} />{!item.isActive && <div className="absolute top-2 right-2 bg-ink/80 c-paper px-2 py-0.5 rounded-sm t-label-caps flex items-center gap-1"><EyeOff size={8} />Hidden</div>}</div>
              <div className="p-3">
                <p className="t-caption c-ink-muted line-clamp-2 mb-2">{item.caption ?? "No caption"}</p>
                {item.productSlug && <p className="t-caption c-gold-deep mb-1">/{item.productSlug}</p>}
                <div className="flex items-center gap-1 flex-wrap">
                  <button onClick={() => moveItem(item.id, "up")} disabled={idx === 0} className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move up"><ArrowUp size={12} /></button>
                  <button onClick={() => moveItem(item.id, "down")} disabled={idx === arr.length - 1} className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move down"><ArrowDown size={12} /></button>
                  <button onClick={() => startEdit(item)} className="inline-flex items-center gap-1 px-2 py-1 t-label-caps c-ink hover:c-gold hover:bg-gold/10 rounded-sm transition-all"><Pencil size={10} />Edit</button>
                  <button onClick={() => toggleActive(item.id, item.isActive)} className={cn("p-1.5 t-label-caps rounded-sm transition-all", item.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>{item.isActive ? <EyeOff size={10} /> : <Eye size={10} />}</button>
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all ml-auto"><Trash2 size={10} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
