"use client";

import { useEffect, useState, type FormEvent } from "react";

import { motion } from "framer-motion";
import { Sparkles, Plus, Trash2, Upload, X, Eye, EyeOff, Pencil, ArrowUp, ArrowDown } from "lucide-react";

import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { cn } from "@/lib/utils";

interface Category {
  id: string; name: string; slug: string; description: string | null;
  heroImage: string | null; sortOrder: number; isActive: boolean;
  productCount: number;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    fetch("/api/admin/content/categories")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  const onNameChange = (v: string) => { setName(v); if (!slug) setSlug(slugify(v)); };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("folder", "aura-living/categories");
      formData.append("context", "category");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Upload failed");
      }
      const data = await res.json();
      setHeroImage(data.fullUrl ?? data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName(""); setSlug(""); setDescription(""); setHeroImage("");
    setEditingId(null);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setHeroImage(cat.heroImage ?? "");
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
        ? `/api/admin/content/categories/${editingId}`
        : "/api/admin/content/categories";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug: slug || slugify(name),
          description: description || undefined, heroImage: heroImage || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      const data = await res.json();
      const returned = data.category;
      if (isEditing) {
        setCategories(categories.map((c) => (c.id === editingId ? { ...returned, productCount: c.productCount } : c)));
      } else {
        setCategories([...categories, { ...returned, productCount: 0 }]);
      }
      cancelForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/content/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) setCategories(categories.map((c) => (c.id === id ? { ...c, isActive: !current } : c)));
    } catch { /* ignore */ }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Products in it will be uncategorized.")) return;
    try {
      const res = await fetch(`/api/admin/content/categories/${id}`, { method: "DELETE" });
      if (res.ok) setCategories(categories.filter((c) => c.id !== id));
    } catch { /* ignore */ }
  };

  const moveItem = async (id: string, direction: "up" | "down") => {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await Promise.all([
      fetch(`/api/admin/content/categories/${a.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: b.sortOrder }) }),
      fetch(`/api/admin/content/categories/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: a.sortOrder }) }),
    ]);
    setCategories((prev) => prev.map((s) => {
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
              <span className="w-6 h-px bg-gold" aria-hidden />Catalog
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Categories</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Product categories shown in the mega menu and shop filters.</p>
          </div>
          <button onClick={() => { if (isEditing) cancelForm(); else { resetForm(); setShowForm(!showForm); } }} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0">
            <Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && !isEditing && "rotate-45")} />
            {showForm ? (isEditing ? "Cancel Edit" : "Cancel") : "Add Category"}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <h2 className="t-headline-sm c-ink mb-4">{isEditing ? "Edit Category" : "New Category"}</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Name *</span>
              <input required value={name} onChange={(e) => onNameChange(e.target.value)} className={inputCls} placeholder="Lighting" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Slug *</span>
              <input required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} placeholder="lighting" />
            </label>
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} />
            </label>
            <div className="md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Hero Image</span>
              {heroImage ? (
                <div className="relative inline-block">
                  { }
                  <img src={heroImage} alt="Category" className="w-full max-w-md aspect-video object-cover border border-hairline-cream rounded-sm" />
                  <button type="button" onClick={() => setHeroImage("")} className="absolute -top-2 -right-2 bg-ink c-paper p-1 rounded-full hover:bg-error transition-colors"><X size={12} /></button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-4 py-2.5 rounded-sm cursor-pointer hover:bg-gold-deep transition-colors">
                  <Upload size={14} />
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
                </label>
              )}
            </div>
            <div className="md:col-span-full flex items-center gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
                {saving ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Category")}
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
      ) : categories.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Sparkles size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No categories</p>
          <p className="t-body c-ink-muted mb-6">Add product categories to organize your catalog.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
            <Plus size={14} /> Add Category
          </button>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((cat, idx, arr) => (
            <motion.div key={cat.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
              <div className="relative aspect-video bg-cream">
                {cat.heroImage ? (
                   
                  <img src={cat.heroImage} alt={cat.name} className={cn("w-full h-full object-cover", !cat.isActive && "opacity-50")} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Sparkles size={24} className="c-ink-faint" /></div>
                )}
                {!cat.isActive && <div className="absolute top-2 right-2 bg-ink/80 c-paper px-2 py-1 rounded-sm t-label-caps flex items-center gap-1"><EyeOff size={10} /> Hidden</div>}
              </div>
              <div className="p-4">
                <p className="t-body c-ink font-medium mb-1">{cat.name}</p>
                {cat.description && <p className="t-caption c-ink-faint line-clamp-2 mb-2">{cat.description}</p>}
                <p className="t-caption c-ink-faint">
                  /{cat.slug} · {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                </p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-hairline-cream">
                  {/* Reorder buttons */}
                  <button
                    onClick={() => moveItem(cat.id, "up")}
                    disabled={idx === 0}
                    className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveItem(cat.id, "down")}
                    disabled={idx === arr.length - 1}
                    className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  {/* Edit button */}
                  <button
                    onClick={() => startEdit(cat)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 t-label-caps c-ink hover:c-gold hover:bg-gold/10 rounded-sm transition-all ml-1"
                  >
                    <Pencil size={10} />
                    Edit
                  </button>
                  <button onClick={() => toggleActive(cat.id, cat.isActive)} className={cn("inline-flex items-center gap-1 px-3 py-1.5 t-label-caps rounded-sm transition-all", cat.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>
                    {cat.isActive ? <EyeOff size={10} /> : <Eye size={10} />}
                    {cat.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-1.5 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all ml-auto">
                    <Trash2 size={14} />
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
