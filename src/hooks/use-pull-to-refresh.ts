"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * usePullToRefresh — adds native-style pull-to-refresh on touch devices.
 *
 * When the user pulls down at the top of the page (scrollY === 0) past a
 * threshold, the provided `onRefresh` callback is called. The hook exposes
 * `pullDistance` (in px) so the caller can render a visual indicator.
 *
 * Notes:
 *  - Only activates on touch devices (pointer: coarse).
 *  - Disabled when prefers-reduced-motion is set.
 *  - Respects a 70px threshold; max stretch is 100px for visual feedback.
 *  - Cleans up all listeners on unmount.
 *
 * Usage:
 *   const { pullDistance, isRefreshing } = usePullToRefresh({ onRefresh: refetch });
 */

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // default 70
  maxPull?: number;   // default 100
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 70,
  maxPull = 100,
  disabled = false,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing) return;
      // Only start tracking if the page is at the very top.
      if (window.scrollY > 0) return;
      startYRef.current = e.touches[0]?.clientY ?? null;
    },
    [disabled, isRefreshing]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (startYRef.current === null || isRefreshing) return;
      const currentY = e.touches[0]?.clientY ?? 0;
      const delta = currentY - startYRef.current;
      // Only pull if moving downward (positive delta).
      if (delta <= 0) {
        pullingRef.current = false;
        setPullDistance(0);
        return;
      }
      // Apply friction (1/2) so it feels like rubber-band.
      const frictionDelta = delta * 0.5;
      const clamped = Math.min(frictionDelta, maxPull);
      pullingRef.current = true;
      setPullDistance(clamped);
      // Prevent native scroll bounce when actively pulling.
      if (clamped > 5) e.preventDefault();
    },
    [isRefreshing, maxPull]
  );

  const onTouchEnd = useCallback(async () => {
    if (!pullingRef.current) {
      startYRef.current = null;
      setPullDistance(0);
      return;
    }
    pullingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;
    // Skip on non-touch devices.
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // `passive: false` is required to call preventDefault on touchmove.
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd, disabled]);

  return { pullDistance, isRefreshing };
}
