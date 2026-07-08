"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Download, X, Sparkles } from "lucide-react";

/**
 * InstallPrompt — "Add to Home Screen" prompt for PWA.
 *
 * Shows after the user's 2nd visit (sessionStorage tracks visit count).
 * Uses the beforeinstallprompt event (Chrome/Edge/Android).
 * Dismissible — hides for 30 days if dismissed (localStorage).
 *
 * iOS Safari does not fire `beforeinstallprompt` — for iOS users we show
 * a one-time hint pointing them to Share → Add to Home Screen.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const VISIT_KEY = "aura-visit-count";
const DISMISS_KEY = "aura-install-dismissed";
const IOS_HINT_KEY = "aura-ios-hint-seen";
const DISMISS_DAYS = 30;

export function InstallPrompt() {
  const prefersReducedMotion = useReducedMotion();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIosHint, setIsIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed/standalone — never prompt.
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as { standalone?: boolean }).standalone === true) return;

    // Track visit count
    let visits = 0;
    try {
      visits = parseInt(window.sessionStorage.getItem(VISIT_KEY) ?? "0", 10) + 1;
      window.sessionStorage.setItem(VISIT_KEY, String(visits));
    } catch {
      // sessionStorage unavailable
    }

    // Check if dismissed recently
    try {
      const dismissed = window.localStorage.getItem(DISMISS_KEY);
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        if (daysSince < DISMISS_DAYS) return;
      }
    } catch {
      // localStorage unavailable
    }

    // Only show after 2nd visit
    if (visits < 2) return;

    // iOS detection — no beforeinstallprompt, show one-time hint.
    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIos) {
      try {
        if (window.localStorage.getItem(IOS_HINT_KEY)) return;
      } catch {
        /* ignore */
      }
      const t = setTimeout(() => {
        setIsIosHint(true);
        setVisible(true);
      }, 3500);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 3s delay so it doesn't interrupt
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const accept = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
      if (isIosHint) window.localStorage.setItem(IOS_HINT_KEY, "1");
    } catch {
      // localStorage unavailable
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[60px] lg:bottom-6 inset-x-3 lg:inset-x-4 z-overlay lg:z-sticky"
          role="dialog"
          aria-label="Install app"
        >
          <div className="bg-ink c-paper rounded-sm shadow-premium max-w-md mx-auto overflow-hidden">
            <div className="flex items-start gap-4 p-4 md:p-5">
              <div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} strokeWidth={1.5} className="c-gold-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="t-headline-sm c-paper mb-1">Install Aura Living</p>
                <p className="t-body-sm c-paper/70 leading-relaxed">
                  {isIosHint
                    ? "Tap the Share icon in Safari, then Add to Home Screen for offline access."
                    : "Add to your home screen for faster access and offline browsing."}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {!isIosHint && (
                    <button
                      onClick={accept}
                      className="t-label-caps bg-gold-deep c-paper hover:bg-paper hover:c-ink transition-colors px-4 py-2 rounded-sm inline-flex items-center gap-1.5"
                    >
                      <Download size={13} strokeWidth={2} />
                      Install
                    </button>
                  )}
                  <button
                    onClick={dismiss}
                    className="t-label-caps c-paper/60 hover:c-paper transition-colors px-3 py-2 link-underline"
                  >
                    {isIosHint ? "Got it" : "Not now"}
                  </button>
                </div>
              </div>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="p-1.5 c-paper/40 hover:c-paper transition-colors flex-shrink-0"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPrompt;
