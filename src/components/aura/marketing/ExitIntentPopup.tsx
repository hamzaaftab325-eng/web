"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Gift, Mail, Check, Sparkles, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFocusTrap } from "@/hooks/use-focus-trap";

const SESSION_KEY = "aura-exit-intent-shown";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_DELAY = 15_000; // 15 seconds (was 30)
// Ignore exit signals in the first few seconds after mount so the popup
// doesn't fire the instant the page loads.
const ARM_DELAY = 3_000; // 3 seconds (was 5)

interface ExitIntentData {
  isActive: boolean;
  title: string;
  description: string;
  discountPercent: number | null;
  promoCode: string;
  imageUrl: string;
  triggerDelaySeconds: number;
}

/**
 * ExitIntentPopup — fires once per session when a desktop shopper moves their
 * cursor out the top of the viewport (classic cart-abandon intent), or after a
 * timer on touch devices. Captures an email and reveals a one-time code.
 * Fetches configuration from /api/content/exit-intent.
 */
export function ExitIntentPopup() {
  const prefersReducedMotion = useReducedMotion();
  const { toast } = useToast();

  const [config, setConfig] = useState<ExitIntentData | null>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  useFocusTrap(popupRef, open);

  // Fetch popup configuration from the API
  useEffect(() => {
    fetch("/api/content/exit-intent")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.isActive) setConfig(data); })
      .catch(() => {});
  }, []);

  const armedRef = useRef(false);

  // Mark shown + open. Guarded so it can only fire once per session.
  const trigger = useCallback(() => {
    if (armedRef.current) return;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* storage may be unavailable; proceed anyway */
    }
    setOpen(true);
  }, []);

  // Arm after a short delay, then listen for exit intent + mobile timer.
  useEffect(() => {
    const armTimer = window.setTimeout(() => {
      armedRef.current = true;
    }, ARM_DELAY);

    // Desktop: mouse leaves through the top of the viewport.
    const onMouseOut = (e: MouseEvent) => {
      if (!armedRef.current) return;
      // relatedTarget is null when the pointer leaves the document entirely.
      if (e.relatedTarget === null && e.clientY <= 0) {
        trigger();
      }
    };
    document.addEventListener("mouseout", onMouseOut);

    // Mobile / no-mouse: 15s timer (only if the session hasn't seen it).
    let mobileTimer: number | undefined;
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        mobileTimer = window.setTimeout(() => {
          if (armedRef.current) trigger();
        }, MOBILE_DELAY);
      }
    } catch {
      /* ignore */
    }

    // Also trigger on scroll-back-up (user scrolled down then back to top)
    const onScroll = () => {
      if (!armedRef.current) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      // If user scrolled more than 30% and then came back near the top
      if (scrolled < 100 && maxScroll > 500) {
        trigger();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
      if (mobileTimer) window.clearTimeout(mobileTimer);
    };
  }, [trigger]);

  // Esc to close (only while open).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return;
    setStatus("submitting");

    try {
      // Save the email to the subscriber list
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "exit-intent",
          promoCode: config?.promoCode ?? undefined,
        }),
      });
    } catch {
      // Non-blocking — still show the promo code even if subscribe fails
    }

    setStatus("success");
    toast({
      title: "You're on the list",
      description: "10% off is unlocked — use the code below.",
    });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(config?.promoCode ?? "WELCOME10");
      setCopied(true);
      toast({ title: "Copied", description: `${config?.promoCode ?? "WELCOME10"} on your clipboard.` });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const close = () => setOpen(false);

  // Don't render if config not loaded or popup is inactive
  if (!config) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popupRef}
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Special offer"
        >
          {/* Scrim — click outside to close */}
          <motion.div
            className="absolute inset-0 overlay-dark"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />

          {/* Card */}
          <motion.div
            className={cn(
              "relative w-full max-w-[440px] rounded-sm border shadow-modal overflow-hidden",
              status === "success"
                ? "bg-gold-pale border-hairline-gold"
                : "bg-gradient-card-warm border-hairline-cream card-modern"
            )}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.92, y: 16 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, y: 8 }
            }
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Close */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-paper/80 backdrop-blur-sm border border-hairline rounded-full c-ink hover:c-gold-deep transition-colors"
            >
              <X size={18} strokeWidth={1.25} />
            </button>

            <AnimatePresence mode="wait">
              {status !== "success" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="p-8 sm:p-10 text-center"
                >
                  <motion.div
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { scale: 0.6, opacity: 0 }
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="w-16 h-16 mx-auto rounded-full bg-gold-pale border border-hairline-gold flex items-center justify-center mb-5 shadow-gold-glow"
                  >
                    <Mail size={26} strokeWidth={1.25} className="c-gold-deep" />
                  </motion.div>

                  <p className="t-label-caps c-gold-deep mb-2">Before you go</p>
                  <h2 className="t-headline-md c-ink mb-3 leading-tight">
                    10% off your first order
                  </h2>
                  <p className="t-body-sm c-ink-muted mb-6 leading-relaxed max-w-xs mx-auto">
                    Join the Aura Living list for one considered letter a month —
                    and unlock a welcome gift right now.
                  </p>

                  <form onSubmit={submit} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      aria-label="Email address"
                      className="w-full bg-paper border border-hairline px-4 py-3.5 t-body c-ink placeholder:c-ink-faint focus:border-gold focus:outline-none transition-colors text-center"
                    />
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full h-12 inline-flex items-center justify-center gap-2 bg-ink c-paper t-label-caps rounded-sm hover:bg-gold-deep disabled:opacity-70 transition-colors"
                    >
                      {status === "submitting" ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="inline-block w-3.5 h-3.5 border border-paper/30 border-t-paper rounded-full"
                          />
                          Unlocking
                        </>
                      ) : (
                        <>
                          <Gift size={14} strokeWidth={1.5} />
                          Reveal My Code
                        </>
                      )}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={close}
                    className="t-caption c-ink-faint hover:c-gold-deep transition-colors link-underline mt-5"
                  >
                    No thanks, I'll pay full price
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="p-8 sm:p-10 text-center"
                >
                  <motion.div
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { scale: 0.6, opacity: 0 }
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="w-16 h-16 mx-auto rounded-full bg-paper border border-hairline-gold flex items-center justify-center mb-5 shadow-gold-glow"
                  >
                    <Check size={30} strokeWidth={2} className="c-gold-deep" />
                  </motion.div>

                  <p className="t-label-caps c-gold-deep mb-2 inline-flex items-center gap-1.5">
                    <Sparkles size={13} strokeWidth={1.75} />
                    Unlocked
                  </p>
                  <h2 className="t-headline-md c-ink mb-2 leading-tight">
                    Here's your welcome gift
                  </h2>
                  <p className="t-body-sm c-ink-muted mb-6 leading-relaxed max-w-xs mx-auto">
                    Apply this code at checkout for 10% off your first order.
                  </p>

                  {/* Code reveal */}
                  <div className="bg-paper border border-dashed border-hairline-gold rounded-sm p-4 mb-6 flex items-center justify-between gap-3">
                    <div className="text-left">
                      <p className="t-caption c-ink-faint mb-0.5">Your code</p>
                      <p className="t-headline-md c-gold-deep t-num tracking-[0.15em]">
                        {config?.promoCode ?? "WELCOME10"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="inline-flex items-center gap-1.5 t-label-caps c-ink hover:c-gold-deep border border-hairline px-3 h-9 rounded-sm transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={13} strokeWidth={2} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} strokeWidth={1.5} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={close}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 bg-ink c-paper t-label-caps rounded-sm hover:bg-gold-deep transition-colors"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExitIntentPopup;
