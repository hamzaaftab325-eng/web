"use client";

import { useEffect, useState, type FormEvent } from "react";

import { motion } from "framer-motion";
import { FileText, Plus, Trash2, Eye, EyeOff, Pencil, ArrowUp, ArrowDown } from "lucide-react";

import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { cn } from "@/lib/utils";

interface CareGuide {
  id: string; title: string; slug: string; material: string;
  excerpt: string; body: string; sortOrder: number; isActive: boolean;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminCareGuides() {
  const [guides, setGuides] = useState<CareGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [material, setMaterial] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetch("/api/admin/content/care-guides")
      .then((r) => (r.ok ? r.json() : { careGuides: [] }))
      .then((data) => setGuides(data.careGuides ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  const onTitleChange = (v: string) => { setTitle(v); if (!slug) setSlug(slugify(v)); };

  const resetForm = () => {
    setTitle(""); setSlug(""); setMaterial(""); setExcerpt(""); setBody("");
    setEditingId(null);
  };

  const startEdit = (guide: CareGuide) => {
    setEditingId(guide.id);
    setTitle(guide.title);
    setSlug(guide.slug);
    setMaterial(guide.material);
    setExcerpt(guide.excerpt);
    setBody(typeof guide.body === "string" ? guide.body : "");
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => {
    setShowForm(false);
    resetForm();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const isEditing = !!editingId;
      const url = isEditing
        ? `/api/admin/content/care-guides/${editingId}`
        : "/api/admin/content/care-guides";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug: slug || slugify(title), material, excerpt, body,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      const data = await res.json();
      const returned = data.careGuide;
      if (isEditing) setGuides(guides.map((g) => (g.id === editingId ? returned : g)));
      else setGuides([...guides, returned]);
      cancelForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/content/care-guides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) setGuides(guides.map((g) => (g.id === id ? { ...g, isActive: !current } : g)));
    } catch { /* ignore */ }
  };

  const deleteGuide = async (id: string) => {
    if (!confirm("Delete this care guide?")) return;
    try {
      const res = await fetch(`/api/admin/content/care-guides/${id}`, { method: "DELETE" });
      if (res.ok) setGuides(guides.filter((g) => g.id !== id));
    } catch { /* ignore */ }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const sorted = [...guides].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/admin/content/care-guides/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/admin/content/care-guides/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    setGuides((prev) => prev.map((s) => {
      if (s.id === a.id) return { ...s, sortOrder: b.sortOrder };
      if (s.id === b.id) return { ...s, sortOrder: a.sortOrder };
      return s;
    }));
  };

  const isEditing = !!editingId;

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Product Care
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Care Guides</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Material-specific care instructions for each product type.</p>
          </div>
          <button onClick={() => { if (isEditing) cancelForm(); else { resetForm(); setShowForm(!showForm); } }} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0">
            <Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && !isEditing && "rotate-45")} />
            {showForm ? (isEditing ? "Cancel Edit" : "Cancel") : "Add Guide"}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <h2 className="t-headline-sm c-ink mb-4">{isEditing ? "Edit Care Guide" : "New Care Guide"}</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Title *</span>
              <input required value={title} onChange={(e) => onTitleChange(e.target.value)} className={inputCls} placeholder="Caring for Brass" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Slug *</span>
              <input required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} placeholder="caring-for-brass" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Material *</span>
              <input required value={material} onChange={(e) => setMaterial(e.target.value)} className={inputCls} placeholder="Brass" />
            </label>
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Excerpt *</span>
              <textarea required value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputCls} />
            </label>
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Body *</span>
              <textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={6} className={inputCls} />
            </label>
            <div className="md:col-span-full flex items-center gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
                {saving ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Guide")}
              </button>
              <button type="button" onClick={cancelForm} className="t-label-caps c-ink-faint hover:c-ink">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        </div>
      ) : guides.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <FileText size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No care guides</p>
          <p className="t-body c-ink-muted mb-6">Add care instructions for different materials.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
            <Plus size={14} /> Add Guide
          </button>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...guides].sort((a, b) => a.sortOrder - b.sortOrder).map((guide, idx, arr) => (
            <motion.div key={guide.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                  <FileText size={16} className="c-gold-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("t-body c-ink font-medium", !guide.isActive && "opacity-50")}>{guide.title}</p>
                  <p className="t-caption c-gold-deep">{guide.material}</p>
                  <p className="t-caption c-ink-faint">/{guide.slug}</p>
                </div>
              </div>
              <p className="t-caption c-ink-muted mb-3 line-clamp-2">{guide.excerpt}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-hairline-cream">
                {/* Reorder buttons */}
                <button
                  onClick={() => moveItem(guide.id, "up")}
                  disabled={idx === 0}
                  className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveItem(guide.id, "down")}
                  disabled={idx === arr.length - 1}
                  className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ArrowDown size={14} />
                </button>
                {/* Edit button */}
                <button
                  onClick={() => startEdit(guide)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 t-label-caps c-ink hover:c-gold hover:bg-gold/10 rounded-sm transition-all ml-1"
                >
                  <Pencil size={10} />
                  Edit
                </button>
                <button onClick={() => toggleActive(guide.id, guide.isActive)} className={cn("inline-flex items-center gap-1 px-3 py-1.5 t-label-caps rounded-sm transition-all", guide.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>
                  {guide.isActive ? <EyeOff size={10} /> : <Eye size={10} />}
                  {guide.isActive ? "Hide" : "Show"}
                </button>
                <button onClick={() => deleteGuide(guide.id)} className="p-1.5 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all ml-auto">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
