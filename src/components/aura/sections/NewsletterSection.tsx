"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

import { api } from "@/lib/api/client";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const prefersReducedMotion = useReducedMotion();

  // Phase 5G: Replaced fake setTimeout with real API call to /api/subscribe.
  // Previously this component silently faked a successful subscription —
  // users saw "Welcome to the family" but were never actually subscribed.
  // Now calls the real endpoint (same one Footer.tsx uses).
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    setErrorMessage("");

    try {
      await api.post("/api/subscribe", { email, source: "homepage-newsletter-section" });
      setStatus("success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
      setStatus("error");
    }
  };

  return (
    <section className="section-stack bg-ink c-paper relative overflow-hidden">
      {/* Soft decorative line */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 400">
          <path
            d="M 0,200 Q 300,80 600,200 T 1200,200"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <div className="container-aura relative">
        <div className="max-w-2xl mx-auto text-center">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Stay in touch</p>
          <TextBlurReveal
            as="h2"
            className="t-display-md c-paper leading-tight mb-4"
          >
            Join the Aura Living world.
          </TextBlurReveal>
          <TextBlurReveal
            as="p"
            delay={0.2}
            className="t-body-lg c-paper/70 mb-10 leading-relaxed"
          >
            Receive curated inspiration, early access to new arrivals, and
            exclusive offers — one considered letter a month, never more.
          </TextBlurReveal>

          <AnimatePresence mode="wait">
            {status !== "success" ? (
              <motion.form
                key="form"
                onSubmit={submit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent border border-paper/30 px-4 py-3.5 t-body c-paper placeholder:c-paper/40 focus:border-gold transition-colors outline-none"
                  aria-label="Email address"
                  aria-invalid={status === "error"}
                  aria-describedby={status === "error" ? "newsletter-error" : undefined}
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="btn-hover-spacing group inline-flex items-center justify-center gap-2 bg-paper c-ink t-label-caps px-6 py-3.5 rounded-sm disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    prefersReducedMotion ? (
                      <span className="inline-block w-3.5 h-3.5 border border-ink/30 border-t-ink rounded-full" />
                    ) : (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-3.5 h-3.5 border border-ink/30 border-t-ink rounded-full"
                      />
                    )
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight
                        size={14}
                        strokeWidth={1.5}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <Check size={28} strokeWidth={1.5} className="c-gold" />
                </div>
                <p className="t-headline-md c-paper">Welcome to the family.</p>
                <p className="t-body c-paper/70">
                  Look for our first letter in your inbox this week.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 5G: Error message — shown below form, allows retry */}
          {status === "error" && (
            <p
              id="newsletter-error"
              role="alert"
              className="t-caption c-error mt-3"
            >
              {errorMessage}
            </p>
          )}

          <p className="t-caption c-paper/40 mt-6">
            One letter a month. Unsubscribe anytime. We never share your email.
          </p>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
