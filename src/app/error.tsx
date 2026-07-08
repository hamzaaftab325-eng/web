"use client";

import { useEffect } from "react";

import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

/**
 * app/error.tsx — branded 500 error boundary.
 *
 * Catches unhandled runtime errors anywhere in the app tree.
 * Shows a calm, on-brand message with retry + home CTAs.
 * Honors prefers-reduced-motion.
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
     
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl text-center"
      >
        <div className="w-16 h-16 rounded-full bg-gold-pale flex items-center justify-center mx-auto mb-8">
          <AlertCircle size={28} strokeWidth={1.25} className="c-gold-deep" />
        </div>

        <p className="t-label-caps c-gold-deep mb-4 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-gold" aria-hidden />
          Error 500
          <span className="w-6 h-px bg-gold" aria-hidden />
        </p>

        <h1 className="t-display-md c-ink leading-tight mb-5">
          Something went wrong.
        </h1>

        <p className="t-body-lg c-ink-muted leading-relaxed mb-10 max-w-md mx-auto">
          An unexpected error occurred while loading this page. You can try
          again, or return to the home page. If the problem persists, our
          concierge will help.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="group inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3.5 hover:bg-gold-deep transition-colors rounded-sm"
          >
            <RotateCcw size={14} strokeWidth={1.5} />
            Try again
          </button>
          <a
            href="/"
            className="group inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline px-6 py-3.5"
          >
            <Home size={14} strokeWidth={1.5} />
            Back to home
          </a>
        </div>

        {error.digest && (
          <p className="t-caption c-ink-faint mt-10 t-num">
            Reference: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
