"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MousePointerClick, Save, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

interface Popup {
  id?: string;
  isActive: boolean;
  title: string;
  description: string;
  discountPercent: number | null;
  promoCode: string;
  imageUrl: string;
  triggerDelaySeconds: number;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminExitIntent() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content/exit-intent")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.popup) {
          setPopup(data.popup);
        } else {
          setPopup({ isActive: true, title: "Wait! 10% off your first order", description: "Enter your email for a one-time discount code.", discountPercent: 10, promoCode: "WELCOME10", imageUrl: "", triggerDelaySeconds: 30 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/content/exit-intent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(popup),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8"><div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div></div>;

  return (
    <div>
      <div className="mb-10 relative">
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-gold-pale to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" aria-hidden />
        <div className="relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Marketing</p>
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">Exit Intent Popup</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">Configure the popup shown when a visitor is about to leave without purchasing.</p>
        </div>
      </div>

      {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
      {saved && <div className="bg-success/10 border border-success/30 c-success p-3 rounded-sm mb-4 t-body-sm">✓ Popup saved successfully</div>}

      {popup && (
        <form onSubmit={onSubmit} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 space-y-5 max-w-2xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" role="switch" aria-checked={popup.isActive} onClick={() => setPopup({ ...popup, isActive: !popup.isActive })}
              className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", popup.isActive ? "bg-ink" : "bg-cream-deep border border-hairline")}>
              <span className={cn("inline-block h-4 w-4 rounded-full bg-paper shadow-ambient transition-all", popup.isActive ? "ml-auto mr-1.5" : "ml-1.5")} />
            </button>
            <span className="t-body c-ink">{popup.isActive ? "Active" : "Inactive"}</span>
            {popup.isActive ? <Eye size={14} className="c-success" /> : <EyeOff size={14} className="c-ink-faint" />}
          </label>

          <label className="block">
            <span className="t-label-caps c-ink-faint block mb-1.5">Popup Title *</span>
            <input required value={popup.title} onChange={e => setPopup({ ...popup, title: e.target.value })} className={inputCls} />
          </label>

          <label className="block">
            <span className="t-label-caps c-ink-faint block mb-1.5">Description</span>
            <textarea value={popup.description} onChange={e => setPopup({ ...popup, description: e.target.value })} rows={2} className={inputCls} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Discount %</span>
              <input type="number" min="0" max="100" value={popup.discountPercent ?? ""} onChange={e => setPopup({ ...popup, discountPercent: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Promo Code</span>
              <input value={popup.promoCode} onChange={e => setPopup({ ...popup, promoCode: e.target.value.toUpperCase() })} className={inputCls} />
            </label>
          </div>

          <label className="block">
            <span className="t-label-caps c-ink-faint block mb-1.5">Background Image URL (optional)</span>
            <input value={popup.imageUrl} onChange={e => setPopup({ ...popup, imageUrl: e.target.value })} className={inputCls} placeholder="https://..." />
          </label>

          <label className="block">
            <span className="t-label-caps c-ink-faint block mb-1.5">Trigger Delay (seconds)</span>
            <input type="number" min="0" max="300" value={popup.triggerDelaySeconds} onChange={e => setPopup({ ...popup, triggerDelaySeconds: Number(e.target.value) })} className={inputCls} />
            <p className="t-caption c-ink-faint mt-1">How long the visitor must be on the page before the exit intent triggers.</p>
          </label>

          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
            <Save size={14} /> {saving ? "Saving..." : "Save Popup"}
          </button>
        </form>
      )}

      <div className="mt-6 bg-gold-pale/30 border border-hairline-gold rounded-sm p-4 flex items-start gap-3 max-w-2xl">
        <MousePointerClick size={18} className="c-gold-deep flex-shrink-0 mt-0.5" />
        <div>
          <p className="t-body-sm c-ink font-medium mb-1">How it works</p>
          <p className="t-caption c-ink-muted">
            The popup triggers when the visitor moves their mouse toward the top of the screen (the exit intent).
            The trigger delay adds an additional wait — the visitor must be on the page for at least this many seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
