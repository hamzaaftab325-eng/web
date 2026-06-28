"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";

/**
 * useAnnounce — screen reader announcements for async state changes.
 *
 * Returns an `announce` function and a `renderLiveRegion` function.
 * Call `announce("message")` to speak to screen readers. Place
 * `{renderLiveRegion()}` in your JSX to render the aria-live region.
 *
 * Usage:
 *   const { announce, renderLiveRegion } = useAnnounce();
 *   announce("Item added to cart");
 *   return <>{renderLiveRegion()}</>
 *
 * For assertive announcements (errors), pass "assertive":
 *   announce("Form validation failed", "assertive");
 */

export function useAnnounce() {
  const [message, setMessage] = useState("");
  const [politeness, setPoliteness] = useState<"polite" | "assertive">("polite");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((msg: string, level: "polite" | "assertive" = "polite") => {
    setPoliteness(level);
    // Clear then set to ensure screen readers re-announce identical messages
    setMessage("");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage(msg), 50);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const renderLiveRegion = useCallback(() => {
    return (
      <span
        aria-live={politeness}
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </span>
    );
  }, [message, politeness]);

  return { announce, renderLiveRegion };
}

export default useAnnounce;
