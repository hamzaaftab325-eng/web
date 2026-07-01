"use client";

import { useEffect, useState } from "react";

const FALLBACK_ITEMS = [
  "Artisan Crafted",
  "Sustainably Sourced",
  "Slow Made",
  "Workshop Traced",
  "Lifetime Care",
  "Designed in Lahore",
];

interface MarqueeItem {
  id: string;
  text: string;
}

export function BrandMarquee() {
  const [items, setItems] = useState<string[]>(FALLBACK_ITEMS);

  useEffect(() => {
    fetch("/api/content/brand-marquee")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: MarqueeItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data.map((item) => item.text));
        }
      })
      .catch(() => {
        // Keep fallback items on error
      });
  }, []);

  // Triple the items for seamless scrolling
  const displayItems = [...items, ...items, ...items];

  return (
    <section className="bg-ink c-paper py-5 md:py-6 overflow-hidden">
      <div className="marquee-track whitespace-nowrap">
        {displayItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-8 px-8 t-label-caps c-paper/80"
          >
            {item}
            <span className="c-gold text-base leading-none">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}

export default BrandMarquee;
