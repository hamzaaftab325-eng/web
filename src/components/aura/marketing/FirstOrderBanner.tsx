"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Sparkles, ArrowRight, Gift } from "lucide-react";

interface FirstOrderOfferData {
  isActive: boolean;
  discountPercent: number;
  promoCode: string;
  popupTitle: string;
  popupDescription: string;
  bannerText: string;
  dismissDurationDays: number;
  showDelayMs: number;
}

/**
 * FirstOrderBanner — popup that appears after a delay.
 * Fetches offer config from /api/content/first-order-offer.
 * Dismissal persists for dismissDurationDays (default 30).
 */
export function FirstOrderBanner() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [offer, setOffer] = useState<FirstOrderOfferData | null>(null);

  // Fetch offer config from API
  useEffect(() => {
    fetch("/api/content/first-order-offer")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.isActive) setOffer(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!offer) return;
    const storageKey = "aura-first-order-popup-dismissed";
    const dismissMs = (offer.dismissDurationDays ?? 30) * 24 * 60 * 60 * 1000;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const at = Number(raw);
        if (Number.isFinite(at) && Date.now() - at < dismissMs) return;
      }
    } catch { /* localStorage unavailable */ }
    const timer = setTimeout(() => setVisible(true), offer.showDelayMs ?? 3000);
    return () => clearTimeout(timer);
  }, [offer]);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem("aura-first-order-popup-dismissed", String(Date.now()));
    } catch { /* ignore */ }
  }, []);

  const goToSignup = () => {
    dismiss();
    router.push("/signup");
  };

  if (!offer) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="First order offer"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-toast w-auto md:w-80"
        >
          <div className="bg-gradient-card-warm border border-hairline-gold shadow-modal rounded-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-gold via-gold-soft to-gold" aria-hidden />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-pale to-cream flex items-center justify-center ring-1 ring-hairline-gold">
                    <Gift size={18} strokeWidth={1.25} className="c-gold-deep" />
                  </div>
                  <p className="t-label-caps c-gold-deep flex items-center gap-1">
                    <Sparkles size={10} strokeWidth={2} />
                    First Order Offer
                  </p>
                </div>
                <button type="button" onClick={dismiss} aria-label="Dismiss offer" className="p-1 c-ink-faint hover:c-ink transition-colors">
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>

              <p className="t-body c-ink mb-1 font-medium">{offer.popupTitle}</p>
              <p className="t-caption c-ink-muted mb-4">{offer.popupDescription}</p>

              <button onClick={goToSignup} className="w-full bg-ink c-paper t-label-caps py-3 hover:bg-gold-deep transition-colors rounded-sm flex items-center justify-center gap-2">
                Sign Up & Reveal Code
                <ArrowRight size={12} strokeWidth={2} />
              </button>

              <p className="t-caption c-ink-faint text-center mt-2">
                Use code <span className="c-gold-deep font-medium">{offer.promoCode}</span> at checkout
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FirstOrderBanner;
