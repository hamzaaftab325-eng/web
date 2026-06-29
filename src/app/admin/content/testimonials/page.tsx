"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

interface Testimonial {
  id: string; authorName: string; authorLocation: string | null;
  quote: string; rating: number; productSlug: string | null;
  sortOrder: number; isActive: boolean;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState("");
  const [authorLocation, setAuthorLocation] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [productSlug, setProductSlug] = useState("");

  useEffect(() => {
    fetch("/api/admin/content/testimonials")
      .then((r) => (r.ok ? r.json() : { testimonials: [] }))
      .then((data) => setItems(data.testimonials ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName, authorLocation: authorLocation || undefined,
          quote, rating, productSlug: productSlug || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setItems([...items, data.testimonial]);
      setShowForm(false);
      setAuthorName(""); setAuthorLocation(""); setQuote(""); setRating(5); setProductSlug("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/content/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (res.ok) setItems(items.map((i) => (i.id === id ? { ...i, isActive: !current } : i)));
    } catch { /* ignore */ }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/content/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) setItems(items.filter((i) => i.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />Social Proof
            </p>
            <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Testimonials</TextBlurReveal>
            <p className="t-body c-ink-muted max-w-lg">Curated customer quotes shown on the home page.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 rounded-sm hover:bg-gold-deep transition-colors flex-shrink-0">
            <Plus size={16} strokeWidth={1.5} className={cn("transition-transform", showForm && "rotate-45")} />
            {showForm ? "Cancel" : "Add Testimonial"}
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 mb-6">
          <h2 className="t-headline-sm c-ink mb-4">New Testimonial</h2>
          {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Author Name *</span>
              <input required value={authorName} onChange={(e) => setAuthorName(e.target.value)} className={inputCls} placeholder="Eleanor Whitfield" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Location</span>
              <input value={authorLocation} onChange={(e) => setAuthorLocation(e.target.value)} className={inputCls} placeholder="Asheville, NC" />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Rating</span>
              <div className="flex items-center gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)}>
                    <Star size={24} className={cn(star <= rating ? "fill-gold c-gold" : "c-ink-faint/30")} />
                  </button>
                ))}
              </div>
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Product Slug (optional)</span>
              <input value={productSlug} onChange={(e) => setProductSlug(e.target.value)} className={inputCls} placeholder="halo-ceramic-lamp" />
            </label>
            <label className="block md:col-span-full">
              <span className="t-label-caps c-ink-faint block mb-1.5">Quote *</span>
              <textarea required value={quote} onChange={(e) => setQuote(e.target.value)} rows={3} className={inputCls} placeholder="The matte glaze is even warmer in person..." />
            </label>
            <div className="md:col-span-full flex items-center gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
                {saving ? "Creating..." : "Create Testimonial"}
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
      ) : items.length === 0 ? (
        <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-12 text-center">
          <Users size={40} strokeWidth={1} className="c-ink-faint mx-auto mb-4" />
          <p className="t-headline-sm c-ink mb-2">No testimonials</p>
          <p className="t-body c-ink-muted mb-6">Add customer quotes to build trust.</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors">
            <Plus size={14} /> Add Testimonial
          </button>
        </div>
      ) : (
        <RevealOnScroll stagger={0.04} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-12 h-12 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 ring-1 ring-hairline-gold">
                  <span className="t-label-caps c-gold-deep">{item.authorName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="t-body c-ink font-medium">{item.authorName}</p>
                  {item.authorLocation && <p className="t-caption c-ink-faint">{item.authorLocation}</p>}
                  {item.productSlug && <p className="t-caption c-gold-deep">/{item.productSlug}</p>}
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className={cn(s <= item.rating ? "fill-gold c-gold" : "c-ink-faint/30")} />
                  ))}
                </div>
              </div>
              <p className={cn("t-body-sm c-ink-muted italic mb-4", !item.isActive && "opacity-50")}>&ldquo;{item.quote}&rdquo;</p>
              <div className="flex items-center gap-2 pt-4 border-t border-hairline-cream">
                <button onClick={() => toggleActive(item.id, item.isActive)} className={cn("px-3 py-1.5 t-label-caps rounded-sm transition-all", item.isActive ? "bg-cream-deep c-ink-muted hover:bg-error/10 hover:c-error" : "bg-success/10 c-success hover:bg-success hover:c-paper")}>
                  {item.isActive ? "Hide" : "Show"}
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-2 c-ink-faint hover:c-error hover:bg-error/5 rounded-sm transition-all ml-auto">
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
