"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
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

  useEffect(() => {
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

  return { timeLeft, expired };
}

export function FlashSaleBanner({ sale }: { sale: FlashSaleData }) {
  const { timeLeft, expired } = useCountdown(sale.endDate);
  if (expired) return null;

  return (
    <div className="bg-ink text-paper py-6 md:py-8">
      <div className="container-aura">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <Zap size={20} className="c-gold" />
            </div>
            <div>
              <h2 className="t-headline-sm c-paper">{sale.name}</h2>
              {sale.description && (
                <p className="t-body-sm c-paper/70 mt-0.5">{sale.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {sale.discountPercent && (
              <div className="bg-gold c-ink px-4 py-2 rounded-sm">
                <span className="t-headline-sm t-num">{Math.round(sale.discountPercent)}% OFF</span>
              </div>
            )}

            {/* Countdown */}
            <div className="flex items-center gap-2">
              {[
                { value: timeLeft.days, label: "D" },
                { value: timeLeft.hours, label: "H" },
                { value: timeLeft.minutes, label: "M" },
                { value: timeLeft.seconds, label: "S" },
              ].map((unit) => (
                <div key={unit.label} className="text-center">
                  <div className="bg-paper/10 border border-paper/20 rounded-sm w-11 h-11 flex items-center justify-center">
                    <span className="t-headline-sm t-num c-paper">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="t-caption c-paper/50 mt-1 block">{unit.label}</span>
                </div>
              ))}
            </div>

            {sale.promoCode && (
              <div className="hidden md:flex items-center gap-2 bg-paper/10 border border-paper/20 rounded-sm px-3 py-2">
                <span className="t-caption c-paper/60">Code:</span>
                <span className="t-body-sm t-num c-gold font-medium">{sale.promoCode}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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