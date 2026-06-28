"use client";

const items = [
  "Artisan Crafted",
  "Sustainably Sourced",
  "Slow Made",
  "Workshop Traced",
  "Lifetime Care",
  "Designed in Lahore",
];

export function BrandMarquee() {
  return (
    <section className="bg-ink c-paper py-5 md:py-6 overflow-hidden">
      <div className="marquee-track whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
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
