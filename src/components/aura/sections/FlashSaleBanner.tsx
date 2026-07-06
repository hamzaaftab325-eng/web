"use client";

import { useEffect, useState, useRef } from "react";
import { Zap, Copy, Check, ChevronRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface FlashSaleData {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number | null;
  promoCode: string | null;
  endDate: string;
}

function useCountdown(endDateStr: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calc = () => {
      const diff = new Date(endDateStr).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endDateStr]);

  return { timeLeft, expired, mounted };
}

/* ─── Countdown digit box ─── */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, "0");
  const d1 = str[0];
  const d2 = str[1];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-[3px]">
        <div className="w-7 h-8 sm:w-9 sm:h-10 rounded-md bg-paper/[0.08] border border-paper/[0.12] flex items-center justify-center backdrop-blur-sm">
          <span className="t-headline-sm t-num c-paper font-medium">{d1}</span>
        </div>
        <div className="w-7 h-8 sm:w-9 sm:h-10 rounded-md bg-paper/[0.08] border border-paper/[0.12] flex items-center justify-center backdrop-blur-sm">
          <span className="t-headline-sm t-num c-paper font-medium">{d2}</span>
        </div>
      </div>
      <span className="t-caption c-paper/40 text-[9px] tracking-[0.15em] uppercase">{label}</span>
    </div>
  );
}

/* ─── Copy promo code button ─── */
function PromoCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-2 bg-paper/[0.07] border border-paper/[0.15] rounded-md px-3 py-2 hover:bg-paper/[0.12] transition-all duration-300"
    >
      <div className="flex flex-col items-start">
        <span className="t-caption c-paper/40 text-[8px] tracking-[0.15em] uppercase leading-none">Code</span>
        <span className="t-body-sm t-num c-gold font-semibold tracking-[0.1em] leading-tight mt-0.5">{code}</span>
      </div>
      <div className="w-px h-6 bg-paper/15" />
      <span className={cn(
        "flex items-center gap-1 text-[10px] t-label-caps tracking-wider transition-all duration-300",
        copied ? "c-success" : "c-paper/50 group-hover:c-paper/80"
      )}>
        {copied ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} strokeWidth={1.5} />}
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

/* ─── Main Banner ─── */
export function FlashSaleBanner({ sale }: { sale: FlashSaleData }) {
  const { timeLeft, expired, mounted } = useCountdown(sale.endDate);
  const bannerRef = useRef<HTMLDivElement>(null);

  if (expired) return null;

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hrs" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ];

  return (
    <div
      ref={bannerRef}
      className="relative overflow-hidden bg-gradient-to-r from-ink via-ink to-ink/95"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Gold accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      {/* Glow effect behind discount */}
      {sale.discountPercent && (
        <div className="absolute top-1/2 -translate-y-1/2 left-[5%] w-48 h-48 bg-gold/8 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="relative container-aura py-5 md:py-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8">
          {/* Left: Info */}
          <div className="flex items-start gap-4 min-w-0">
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-gold/25 to-gold/5 border border-gold/20 flex items-center justify-center shadow-glow-gold">
                <Zap size={20} className="c-gold" strokeWidth={2} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-ink" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="t-headline-sm c-paper truncate">{sale.name}</h2>
                {sale.discountPercent && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gold c-ink text-[10px] t-label-caps t-num font-bold tracking-wider shadow-sm flex-shrink-0">
                    {Math.round(sale.discountPercent)}% OFF
                  </span>
                )}
              </div>
              {sale.description && (
                <p className="t-body-sm c-paper/50 mt-1 line-clamp-1 leading-relaxed">{sale.description}</p>
              )}
            </div>
          </div>

          {/* Right: Countdown + Promo */}
          <div className="flex items-center gap-5 md:gap-6 flex-shrink-0">
            {/* Countdown */}
            {mounted && (
              <div className="flex items-center gap-2.5">
                {units.map((unit, i) => (
                  <div key={unit.label} className="flex items-center">
                    <CountdownUnit value={unit.value} label={unit.label} />
                    {i < units.length - 1 && (
                      <span className="c-paper/30 text-lg font-light mx-0.5 mb-4">:</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Separator */}
            {sale.promoCode && mounted && (
              <div className="hidden md:block w-px h-10 bg-paper/10" />
            )}

            {/* Promo code */}
            {sale.promoCode && (
              <PromoCodeButton code={sale.promoCode} />
            )}
          </div>
        </div>
      </div>

      {/* Gold accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </div>
  );
}

/* ─── Loader (fetches data) ─── */
export function FlashSaleBannerLoader() {
  const [sale, setSale] = useState<FlashSaleData | null>(null);

  useEffect(() => {
    fetch("/api/content/flash-sales")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSale(data))
      .catch(() => {});
  }, []);

  if (!sale) return null;
  return <FlashSaleBanner sale={sale} />;
}

export default FlashSaleBannerLoader;