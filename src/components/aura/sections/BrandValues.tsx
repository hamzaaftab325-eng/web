"use client";

import { motion } from "framer-motion";
import { Hammer, Leaf, Clock, Compass } from "lucide-react";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

const values = [
  {
    icon: Hammer,
    title: "Artisan Crafted",
    body: "Each piece is thrown, welded, or woven by hand in small workshops we visit and know by name.",
  },
  {
    icon: Leaf,
    title: "Sustainably Sourced",
    body: "We trace every material — the clay, the brass, the linen — back to its origin and its maker.",
  },
  {
    icon: Clock,
    title: "Timeless Design",
    body: "We design for a decade of use, not a season. Each object is meant to outlast a trend cycle.",
  },
  {
    icon: Compass,
    title: "Thoughtfully Curated",
    body: "We sell fewer things, more carefully. No catalogue — only the pieces we'd put in our own homes.",
  },
];

export function BrandValues() {
  return (
    <section className="section-stack bg-canvas">
      <div className="container-aura">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Our Values</p>
          <TextBlurReveal
            as="h2"
            className="t-display-md c-ink leading-tight mb-4"
          >
            Four things we don't compromise on.
          </TextBlurReveal>
          <p className="t-body c-ink-muted">
            They shape what we make, who we make it with, and what we'll never
            put our name on.
          </p>
        </div>

        <RevealOnScroll stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                },
              }}
              className="text-center md:text-left"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-5 border border-hairline-cream rounded-full">
                <v.icon size={20} strokeWidth={1.25} className="c-ink" />
              </div>
              <h3 className="t-headline-sm c-ink mb-3">{v.title}</h3>
              <p className="t-body c-ink-muted leading-relaxed">{v.body}</p>
            </motion.div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}

export default BrandValues;
