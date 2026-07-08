"use client";

import { useEffect } from "react";

import Link from "next/link";

import { BookOpen } from "lucide-react";

/**
 * Segment-level error boundary for /journal.
 *
 * Phase 4D.
 */
export default function JournalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[journal/error] Section error:", error);
  }, [error]);

  return (
    <div className="bg-canvas py-20">
      <div className="container-aura max-w-2xl mx-auto text-center">
        <BookOpen size={48} className="c-ink-faint mx-auto mb-6" aria-hidden />
        <h1 className="t-headline-md c-ink mb-3">Journal temporarily unavailable</h1>
        <p className="t-body c-ink-muted mb-2">
          We couldn&apos;t load the journal right now. Please try again in a moment.
        </p>
        {error.digest && (
          <p className="t-caption c-ink-faint mb-8">
            Error reference: <code className="t-num">{error.digest}</code>
          </p>
        )}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-ink c-paper t-label-caps px-6 py-3 rounded-sm hover:bg-gold-deep transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-ink t-label-caps c-ink px-6 py-3 rounded-sm hover:bg-ink hover:c-paper transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
