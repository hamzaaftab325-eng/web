"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Gift, Save, Eye, EyeOff } from "lucide-react";

import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { cn } from "@/lib/utils";

interface Offer {
  id?: string;
  isActive: boolean;
  discountPercent: number;
  promoCode: string;
  popupTitle: string;
  popupDescription: string;
  bannerText: string;
  dismissDurationDays: number;
  showDelayMs: number;
}

const inputCls = "w-full px-4 py-2.5 t-body c-ink bg-paper border border-hairline-cream rounded-sm outline-none focus:border-gold transition-colors";

export default function AdminFirstOrderOffer() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content/first-order-offer")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.offer) {
          setOffer(data.offer);
        } else {
          setOffer({ isActive: true, discountPercent: 10, promoCode: "WELCOME10", popupTitle: "First order? 10% off", popupDescription: "", bannerText: "", dismissDurationDays: 30, showDelayMs: 3000 });
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
      const res = await fetch("/api/admin/content/first-order-offer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offer),
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
          <TextBlurReveal as="h1" className="t-display-md c-ink leading-tight mb-3">First Order Offer</TextBlurReveal>
          <p className="t-body c-ink-muted max-w-lg">Configure the popup that offers first-time visitors a discount on their first order.</p>
        </div>
      </div>

      {error && <div className="bg-error/10 border border-error/30 c-error p-3 rounded-sm mb-4 t-body-sm">{error}</div>}
      {saved && <div className="bg-success/10 border border-success/30 c-success p-3 rounded-sm mb-4 t-body-sm">✓ Offer saved successfully</div>}

      {offer && (
        <form onSubmit={onSubmit} className="bg-gradient-card-warm border border-hairline-cream rounded-sm p-6 space-y-5 max-w-2xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" role="switch" aria-checked={offer.isActive} onClick={() => setOffer({ ...offer, isActive: !offer.isActive })}
              className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", offer.isActive ? "bg-ink" : "bg-cream-deep border border-hairline")}>
              <span className={cn("inline-block h-4 w-4 rounded-full bg-paper shadow-ambient transition-all", offer.isActive ? "ml-auto mr-1.5" : "ml-1.5")} />
            </button>
            <span className="t-body c-ink">{offer.isActive ? "Active" : "Inactive"}</span>
            {offer.isActive ? <Eye size={14} className="c-success" /> : <EyeOff size={14} className="c-ink-faint" />}
          </label>

          <label className="block">
            <span className="t-label-caps c-ink-faint block mb-1.5">Popup Title *</span>
            <input required value={offer.popupTitle} onChange={e => setOffer({ ...offer, popupTitle: e.target.value })} className={inputCls} />
          </label>

          <label className="block">
            <span className="t-label-caps c-ink-faint block mb-1.5">Popup Description</span>
            <textarea value={offer.popupDescription} onChange={e => setOffer({ ...offer, popupDescription: e.target.value })} rows={2} className={inputCls} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Discount % *</span>
              <input required type="number" min="0" max="100" value={offer.discountPercent} onChange={e => setOffer({ ...offer, discountPercent: Number(e.target.value) })} className={inputCls} />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Promo Code *</span>
              <input required value={offer.promoCode} onChange={e => setOffer({ ...offer, promoCode: e.target.value.toUpperCase() })} className={inputCls} />
            </label>
          </div>

          <label className="block">
            <span className="t-label-caps c-ink-faint block mb-1.5">Banner Text</span>
            <input value={offer.bannerText} onChange={e => setOffer({ ...offer, bannerText: e.target.value })} className={inputCls} placeholder="First order? Get 10% off with code WELCOME10" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Show Delay (ms)</span>
              <input type="number" min="0" max="60000" value={offer.showDelayMs} onChange={e => setOffer({ ...offer, showDelayMs: Number(e.target.value) })} className={inputCls} />
            </label>
            <label className="block">
              <span className="t-label-caps c-ink-faint block mb-1.5">Dismiss Duration (days)</span>
              <input type="number" min="1" max="365" value={offer.dismissDurationDays} onChange={e => setOffer({ ...offer, dismissDurationDays: Number(e.target.value) })} className={inputCls} />
            </label>
          </div>

          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors disabled:opacity-50">
            <Save size={14} /> {saving ? "Saving..." : "Save Offer"}
          </button>
        </form>
      )}

      <div className="mt-6 bg-gold-pale/30 border border-hairline-gold rounded-sm p-4 flex items-start gap-3 max-w-2xl">
        <Gift size={18} className="c-gold-deep flex-shrink-0 mt-0.5" />
        <div>
          <p className="t-body-sm c-ink font-medium mb-1">Important</p>
          <p className="t-caption c-ink-muted">
            The promo code must also exist in the Promo Codes table for checkout to validate it.
            Go to <span className="c-gold-deep font-medium">Promotions</span> to create a matching code.
          </p>
        </div>
      </div>
    </div>
  );
}
