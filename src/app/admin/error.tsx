"use client";

import { useEffect } from "react";

import { RotateCcw, AlertCircle } from "lucide-react";

/**
 * app/admin/error.tsx — admin-specific error boundary.
 * Catches runtime errors in admin routes and shows a compact retry UI.
 * Does NOT show the branded storefront error page — admin users need
 * a quick, functional error state.
 */

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={24} strokeWidth={1.5} className="c-error" />
        </div>
        <h1 className="t-headline-md c-ink mb-3">Something went wrong</h1>
        <p className="t-body-sm c-ink-muted mb-8">
          An error occurred while loading the admin panel. Try again, or refresh the page.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-5 py-2.5 hover:bg-gold-deep transition-colors rounded-sm"
        >
          <RotateCcw size={14} strokeWidth={1.5} />
          Try again
        </button>
        {error.digest && (
          <p className="t-caption c-ink-faint mt-6 t-num">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
