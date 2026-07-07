"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Check } from "lucide-react";

interface FlashSaleData {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number | null;
  promoCode: string | null;
  maxUses: number | null;
  usesCount: number;
  endDate: string;
}

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
}

/** Split a number into individual digits. Returns array of single-digit strings. */
function splitDigits(n: number): string[] {
  return String(n).padStart(2, "0").split("");
}

function getTimeRemaining(endDate: string): CountdownTime | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function CountdownUnit({ value, label }: { value: string[]; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-[3px]">
        <span className="flash-sale-digit-box" aria-hidden="true">{value[0]}</span>
        <span className="flash-sale-digit-box" aria-hidden="true">{value[1]}</span>
      </div>
      <span className="flash-sale-unit-label" aria-hidden="true">{label}</span>
    </div>
  );
}

export function FlashSaleBanner() {
  const [sale, setSale] = useState<FlashSaleData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<CountdownTime | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSale() {
      try {
        const res = await fetch("/api/content/flash-sales");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setSale(data);
          if (data) setTime(getTimeRemaining(data.endDate));
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    fetchSale();
    setMounted(true);

    return () => {
      cancelled = true;
    };
  }, []);

  // Tick every second when sale is active and time remains
  useEffect(() => {
    if (!sale || !time) return;

    timerRef.current = setInterval(() => {
      const remaining = getTimeRemaining(sale.endDate);
      if (!remaining) {
        setTime(null);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      setTime(remaining);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sale, time]);

  const copyCode = useCallback(async () => {
    if (!sale?.promoCode) return;

    try {
      await navigator.clipboard.writeText(sale.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API not available — silently skip
    }
  }, [sale?.promoCode]);

  // Don't render during SSR or if no active sale
  if (!mounted || !sale) return null;
  if (error) return null;
  if (!time) return null;

  const remainingLabel = sale.maxUses
    ? `${sale.maxUses - sale.usesCount} left`
    : undefined;

  return (
    <div className="flash-sale-banner" role="banner" aria-label={`Flash sale: ${sale.name}`}>
      <div className="flash-sale-accent-left" aria-hidden="true" />
      <div className="flash-sale-accent-right" aria-hidden="true" />

      <div className="flash-sale-inner">
        {/* Live indicator */}
        <div className="flash-sale-live-dot" aria-hidden="true" />

        {/* Sale text */}
        <p className="flash-sale-text">
          {sale.discountPercent && (
            <strong>{sale.discountPercent}% off</strong>
          )}
          {" — "}
          {sale.description ?? sale.name}
          {remainingLabel && (
            <span> ({remainingLabel})</span>
          )}
        </p>

        {/* Countdown */}
        <div className="flash-sale-countdown" aria-label={`${time.hours} hours ${time.minutes} minutes ${time.seconds} seconds remaining`}>
          <CountdownUnit value={splitDigits(time.hours)} label="Hrs" />
          <span className="flash-sale-separator" aria-hidden="true">:</span>
          <CountdownUnit value={splitDigits(time.minutes)} label="Min" />
          <span className="flash-sale-separator" aria-hidden="true">:</span>
          <CountdownUnit value={splitDigits(time.seconds)} label="Sec" />
        </div>

        {/* Promo code copy button */}
        {sale.promoCode && (
          <button
            type="button"
            onClick={copyCode}
            className="flash-sale-promo-btn"
            data-copied={copied ? "true" : undefined}
            aria-label={copied ? "Promo code copied" : `Copy promo code ${sale.promoCode}`}
          >
            {copied ? (
              <Check size={12} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Copy size={12} strokeWidth={2} aria-hidden="true" />
            )}
            {copied ? "Copied" : sale.promoCode}
          </button>
        )}
      </div>
    </div>
  );
}

export default FlashSaleBanner;