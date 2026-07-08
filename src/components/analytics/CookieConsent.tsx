"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Cookie, X } from "lucide-react";

/**
 * CookieConsent — dismissible cookie consent banner.
 *
 * Shows at the bottom of the page on first visit. Two buttons:
 * "Accept" (enables analytics) and "Decline" (no analytics).
 * Stores choice in localStorage. On accept, sets window.__analyticsConsent
 * and initializes analytics scripts.
 *
 * Hidden if consent already given. Respects prefers-reduced-motion.
 * Uses existing design system classes only.
 */

const CONSENT_KEY = "aura-analytics-consent";

declare global {
  interface Window {
    __analyticsConsent?: boolean;
    __initAnalytics?: () => void;
  }
}

export function CookieConsent() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const consent = window.localStorage.getItem(CONSENT_KEY);
      if (!consent) {
        // Show banner after 1.5s delay so it doesn't interrupt first paint
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable — don't show banner
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, "accepted");
      window.__analyticsConsent = true;
      window.__initAnalytics?.();
    } catch {
      // Storage unavailable
    }
    setVisible(false);
    setDismissed(true);
  };

  const decline = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, "declined");
      window.__analyticsConsent = false;
    } catch {
      // Storage unavailable
    }
    setVisible(false);
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 inset-x-0 z-overlay lg:bottom-0"
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
        >
          <div className="bg-ink c-paper safe-area-bottom">
            <div className="container-aura py-4 md:py-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Cookie size={16} strokeWidth={1.5} className="c-gold-deep" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="t-body-sm c-paper leading-relaxed">
                      We use cookies to understand how you use the site and
                      improve your experience. No tracking until you accept.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={decline}
                    className="t-label-caps c-paper/70 hover:c-paper transition-colors px-4 py-2.5 link-underline"
                  >
                    Decline
                  </button>
                  <button
                    onClick={accept}
                    className="t-label-caps bg-gold-deep c-paper hover:bg-paper hover:c-ink transition-colors px-5 py-2.5 rounded-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={decline}
                    aria-label="Dismiss"
                    className="p-2 c-paper/50 hover:c-paper transition-colors md:hidden"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;
