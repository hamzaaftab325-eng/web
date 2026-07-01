"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Plus, Trash2, Upload, X, Eye, EyeOff } from "lucide-react";
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
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("folder", "aura-living/hero-slides");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImageUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl, eyebrow, headline, subtitle: subtitle || undefined,
          ctaLabel, ctaLink, altText: altText || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      const data = await res.json();
      setSlides([...slides, data.heroSlide]);
      setShowForm(false);
      setImageUrl(""); setEyebrow(""); setHeadline(""); setSubtitle(""); setCtaLabel("Shop Now"); setCtaLink("/shop"); setAltText("");
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
            <p className="t-body c-ink-muted max-w-lg">Manage the carousel slides on your home page.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0">
            <Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && "rotate-45")} />
            {showForm ? "Cancel" : "Add Slide"}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <h2 className="t-headline-sm c-ink mb-4">New Hero Slide</h2>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                {saving ? "Creating..." : "Create Slide"}
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
      ) : slides.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <ImageIcon size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No hero slides</p>
          <p className="t-body c-ink-muted mb-6">Add your first slide to populate the home page carousel.</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
            <Plus size={14} /> Add Slide
          </button>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <motion.div key={slide.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="group bg-gradient-card-warm border border-hairline-cream rounded-sm overflow-hidden">
              <div className="relative aspect-video bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.imageUrl} alt={slide.altText ?? slide.headline} className={cn("w-full h-full object-cover", !slide.isActive && "opacity-50")} />
                {!slide.isActive && <div className="absolute top-2 right-2 bg-ink/80 c-paper px-2 py-1 rounded-sm t-label-caps flex items-center gap-1"><EyeOff size={10} /> Hidden</div>}
              </div>
              <div className="p-4">
                <p className="t-label-caps c-gold-deep mb-1">{slide.eyebrow}</p>
                <p className="t-body c-ink font-medium mb-1">{slide.headline}</p>
                {slide.subtitle && <p className="t-caption c-ink-faint">{slide.subtitle}</p>}
                <p className="t-caption c-ink-faint mt-2">&ldquo;{slide.ctaLabel}&rdquo; → {slide.ctaLink}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-hairline-cream">
                  <button onClick={() => toggleActive(slide.id, slide.isActive)} className={cn("inline-flex items-center gap-1 px-3 py-1.5 t-label-caps rounded-sm transition-all", slide.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>
                    {slide.isActive ? <EyeOff size={10} /> : <Eye size={10} />}
                    {slide.isActive ? "Hide" : "Show"}
                  </button>
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
