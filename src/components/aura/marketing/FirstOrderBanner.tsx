"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Sparkles, ArrowRight, Gift } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";

const STORAGE_KEY = "aura-first-order-banner-dismissed";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

/**
 * readDismissed — true when a valid, unexpired dismissal timestamp is stored.
 * Returns false on the server, in private mode, or when storage is unavailable.
 */
function readDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const at = Number(raw);
      if (Number.isFinite(at) && Date.now() - at < THIRTY_DAYS) return true;
    }
  } catch {
    /* localStorage unavailable */
  }
  return false;
}

const subscribe = (callback: () => void) => {
  // Cross-tab updates fire the native storage event; same-tab writes are
  // notified by a manual dispatch in `dismiss()`.
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getSnapshot = (): boolean => readDismissed();
const getServerSnapshot = (): boolean => false;

/**
 * FirstOrderBanner — dismissible top announcement bar.
 *
 * "First order? 10% off — Sign up". Renders on a dark ink gradient. Dismissal
 * is timestamped to localStorage and respected for 30 days. The CTA routes to
 * the signup view. Dismissal state is read with `useSyncExternalStore` so it's
 * SSR-safe and free of setState-in-effect.
 */
export function FirstOrderBanner() {
  const prefersReducedMotion = useReducedMotion();
  const setView = useUIStore((s) => s.setView);

  const dismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const visible = !dismissed;

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      // The native `storage` event only fires in *other* tabs, so dispatch one
      // locally to wake our own subscriber and re-render the banner away.
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    } catch {
      /* ignore */
    }
  }, []);

  const goToSignup = () => {
    setView("signup");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="First order offer"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 1, height: "auto" }
          }
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden bg-gradient-to-r from-ink via-ink-soft to-ink c-paper"
        >
          <div className="container-aura safe-area-top">
            <div className="flex items-center justify-between gap-4 py-2.5">
              {/* Message + CTA */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Gift
                  size={15}
                  strokeWidth={1.5}
                  className="c-gold shrink-0"
                  aria-hidden="true"
                />
                <p className="t-body-sm c-paper truncate">
                  <span className="hidden sm:inline">First order? </span>
                  <span className="font-medium">10% off</span>
                  <span className="c-paper/70"> — </span>
                  <button
                    type="button"
                    onClick={goToSignup}
                    className="inline-flex items-center gap-1 c-gold hover:c-gold-soft transition-colors link-underline font-medium"
                  >
                    Sign up
                    <ArrowRight
                      size={12}
                      strokeWidth={2}
                      className="hidden sm:inline"
                    />
                  </button>
                </p>
                <span className="hidden md:inline-flex items-center gap-1 t-caption c-gold/80 border border-gold/30 rounded-full px-2 py-0.5">
                  <Sparkles size={10} strokeWidth={2} />
                  AURA10
                </span>
              </div>

              {/* Dismiss */}
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss offer"
                className="shrink-0 w-7 h-7 flex items-center justify-center c-paper/70 hover:c-gold transition-colors rounded-sm"
              >
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FirstOrderBanner;
