"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";

function UnsubscribeContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Use a flag to avoid setting state after unmount.
    let cancelled = false;
    if (!email) {
      // Defer the setState via microtask to satisfy React 19's
      // react-hooks/set-state-in-effect rule (no synchronous setState in effect).
      queueMicrotask(() => { if (!cancelled) setStatus("error"); });
      return;
    }
    fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`)
      .then(r => { if (!cancelled) setStatus(r.ok ? "success" : "error"); })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [email]);

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        {status === "loading" && (
          <div className="aura-loader-ring mx-auto"><span className="aura-loader-dot" /></div>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-success/30">
              <Check size={32} strokeWidth={2} className="c-success" />
            </div>
            <h1 className="t-display-md c-ink mb-3">Unsubscribed.</h1>
            <p className="t-body c-ink-muted">You&apos;ve been removed from our newsletter. We won&apos;t send you marketing emails anymore.</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6 ring-1 ring-error/30">
              <AlertCircle size={32} strokeWidth={2} className="c-error" />
            </div>
            <h1 className="t-display-md c-ink mb-3">Something went wrong.</h1>
            <p className="t-body c-ink-muted">We couldn&apos;t process your unsubscribe request. Please contact support.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center"><div className="aura-loader-ring"><span className="aura-loader-dot" /></div></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
