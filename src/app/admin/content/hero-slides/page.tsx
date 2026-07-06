"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Plus, Trash2, Upload, X, Eye, EyeOff, Pencil, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface HeroSlide {
  id: string; imageUrl: string; eyebrow: string; headline: string;
  subtitle: string | null; ctaLabel: string; ctaLink: string;
  altText: string | null; sortOrder: number; isActive: boolean;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Shop Now");
  const [ctaLink, setCtaLink] = useState("/shop");
  const [altText, setAltText] = useState("");

  useEffect(() => {
    fetch("/api/admin/content/hero-slides")
      .then((r) => (r.ok ? r.json() : { heroSlides: [] }))
      .then((data) => setSlides(data.heroSlides ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("folder", "aura-living/hero-slides");
      formData.append("context", "hero-slide");
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
    setImageUrl(""); setEyebrow(""); setHeadline(""); setSubtitle("");
    setCtaLabel("Shop Now"); setCtaLink("/shop"); setAltText("");
    setEditingId(null);
  };

  const startEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setImageUrl(slide.imageUrl);
    setEyebrow(slide.eyebrow);
    setHeadline(slide.headline);
    setSubtitle(slide.subtitle ?? "");
    setCtaLabel(slide.ctaLabel);
    setCtaLink(slide.ctaLink);
    setAltText(slide.altText ?? "");
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
      const body = {
        imageUrl, eyebrow, headline, subtitle: subtitle || undefined,
        ctaLabel, ctaLink, altText: altText || undefined,
      };

      const isEditing = !!editingId;
      const url = isEditing
        ? `/api/admin/content/hero-slides/${editingId}`
        : "/api/admin/content/hero-slides";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      const data = await res.json();
      const returned = data.heroSlide;

      if (isEditing) {
        setSlides(slides.map((s) => (s.id === editingId ? returned : s)));
      } else {
        setSlides([...slides, returned]);
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
      const res = await fetch(`/api/admin/content/hero-slides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) setSlides(slides.map((s) => (s.id === id ? { ...s, isActive: !current } : s)));
    } catch { /* ignore */ }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    try {
      const res = await fetch(`/api/admin/content/hero-slides/${id}`, { method: "DELETE" });
      if (res.ok) setSlides(slides.filter((s) => s.id !== id));
    } catch { /* ignore */ }
  };

  const moveSlide = async (id: string, direction: "up" | "down") => {
    const sorted = [...slides].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const slide = sorted[idx];
    const other = sorted[swapIdx];

    // Swap sortOrder values via PUT
    await Promise.all([
      fetch(`/api/admin/content/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: other.sortOrder }),
      }),
      fetch(`/api/admin/content/hero-slides/${other.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: slide.sortOrder }),
      }),
    ]);

    // Update local state with swapped orders
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id === slide.id) return { ...s, sortOrder: other.sortOrder };
        if (s.id === other.id) return { ...s, sortOrder: slide.sortOrder };
        return s;
      })
    );
  };

  const isEditing = !!editingId;

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Home Page
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Hero Slides</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Manage the carousel slides on your home page. Full CRUD: create, edit, reorder, hide, and delete.</p>
          </div>
          <button onClick={() => { if (isEditing) cancelForm(); else { resetForm(); setShowForm(!showForm); } }} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0">
            <Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && !isEditing && "rotate-45")} />
            {showForm ? (isEditing ? "Cancel Edit" : "Cancel") : "Add Slide"}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <h2 className="t-headline-sm c-ink mb-4">{isEditing ? "Edit Hero Slide" : "New Hero Slide"}</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Eyebrow *</span>
              <input required value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} className={inputCls} placeholder="New Collection" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Headline *</span>
              <input required value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputCls} placeholder="The Summer Edit" />
            </label>
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Subtitle</span>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} placeholder="Warm pieces for cooler evenings" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">CTA Label *</span>
              <input required value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputCls} placeholder="Shop Now" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">CTA Link *</span>
              <input required value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} className={inputCls} placeholder="/shop" />
            </label>
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Alt Text</span>
              <input value={altText} onChange={(e) => setAltText(e.target.value)} className={inputCls} placeholder="Description for screen readers" />
            </label>
            <div className="md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Image *</span>
              {imageUrl ? (
                <div className="relative inline-block">
                  { }
                  <img src={imageUrl} alt="Slide preview" className="w-full max-w-md aspect-video object-cover border border-hairline-cream rounded-sm" />
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
            <div className="md:col-span-full flex items-center gap-3">
              <button type="submit" disabled={saving || !imageUrl} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
                {saving ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Slide")}
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
      ) : slides.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <ImageIcon size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No hero slides</p>
          <p className="t-body c-ink-muted mb-6">Add your first slide to populate the home page carousel.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
            <Plus size={14} /> Add Slide
          </button>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...slides].sort((a, b) => a.sortOrder - b.sortOrder).map((slide, idx, arr) => (
            <motion.div key={slide.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="group bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
              <div className="relative aspect-video bg-cream">
                { }
                <img src={slide.imageUrl} alt={slide.altText ?? slide.headline} className={cn("w-full h-full object-cover", !slide.isActive && "opacity-50")} />
                {!slide.isActive && <div className="absolute top-2 right-2 bg-ink/80 c-paper px-2 py-1 rounded-sm t-label-caps flex items-center gap-1"><EyeOff size={10} /> Hidden</div>}
                <div className="absolute top-2 left-2 bg-ink/80 c-paper px-2 py-1 rounded-sm t-label-caps t-num">#{slide.sortOrder + 1}</div>
              </div>
              <div className="p-4">
                <p className="t-label-caps c-gold-deep mb-1">{slide.eyebrow}</p>
                <p className="t-body c-ink font-medium mb-1">{slide.headline}</p>
                {slide.subtitle && <p className="t-caption c-ink-faint">{slide.subtitle}</p>}
                <p className="t-caption c-ink-faint mt-2">&ldquo;{slide.ctaLabel}&rdquo; → {slide.ctaLink}</p>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-hairline-cream">
                  {/* Reorder buttons */}
                  <button
                    onClick={() => moveSlide(slide.id, "up")}
                    disabled={idx === 0}
                    className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveSlide(slide.id, "down")}
                    disabled={idx === arr.length - 1}
                    className="p-1.5 c-ink-faint hover:c-gold hover:bg-gold/10 rounded-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => startEdit(slide)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 t-label-caps c-ink hover:c-gold hover:bg-gold/10 rounded-sm transition-all ml-1"
                  >
                    <Pencil size={10} />
                    Edit
                  </button>

                  {/* Toggle visibility */}
                  <button onClick={() => toggleActive(slide.id, slide.isActive)} className={cn("inline-flex items-center gap-1 px-3 py-1.5 t-label-caps rounded-sm transition-all", slide.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>
                    {slide.isActive ? <EyeOff size={10} /> : <Eye size={10} />}
                    {slide.isActive ? "Hide" : "Show"}
                  </button>

                  {/* Delete */}
                  <button onClick={() => deleteSlide(slide.id)} className="p-1.5 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all ml-auto">
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
