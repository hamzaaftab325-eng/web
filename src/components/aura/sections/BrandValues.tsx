"use client";

import { motion } from "framer-motion";
import {
  Hammer,
  Leaf,
  Clock,
  Compass,
  Heart,
  Award,
  Gem,
  Sprout,
  Recycle,
  Hand,
  Globe,
  Star,
  Shield,
  Truck,
  Package,
  type LucideIcon,
} from "lucide-react";

import { useBrandValues } from "@/hooks/queries/use-content";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

// Fallback values used when DB has no data or fetch fails
const fallbackValues = [
  { icon: "Hammer", title: "Artisan Crafted", body: "Each piece is thrown, welded, or woven by hand in small workshops we visit and know by name." },
  { icon: "Leaf", title: "Sustainably Sourced", body: "We trace every material — the clay, the brass, the linen — back to its origin and its maker." },
  { icon: "Clock", title: "Timeless Design", body: "We design for a decade of use, not a season. Each object is meant to outlast a trend cycle." },
  { icon: "Compass", title: "Thoughtfully Curated", body: "We sell fewer things, more carefully. No catalogue — only the pieces we'd put in our own homes." },
];

/**
 * Phase 7A: Static icon map — replaces `import * as LucideIcons`.
 *
 * Previously: `import * as LucideIcons from "lucide-react"` imported the ENTIRE
 * icon library (~1,500 icons, hundreds of KB) just to resolve icon names by
 * string. Now: only the icons actually used are imported, saving ~150-300 KB
 * from the main bundle.
 *
 * To add a new icon for admin use: add it to the import list above + the map below.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Hammer,
  Leaf,
  Clock,
  Compass,
  Heart,
  Award,
  Gem,
  Sprout,
  Recycle,
  Hand,
  Globe,
  Star,
  Shield,
  Truck,
  Package,
};

// Map icon name strings to Lucide icon components
function getIcon(name: string): LucideIcon {
  // Try exact match first (case-sensitive)
  if (ICON_MAP[name]) return ICON_MAP[name];
  // Try capitalized match (e.g., "hammer" → "Hammer")
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  if (ICON_MAP[capitalized]) return ICON_MAP[capitalized];
  // Fallback to Hammer
  return Hammer;
}

export function BrandValues() {
  const { data: dbValues } = useBrandValues();

  // Use DB values if available, otherwise fallback
  const values = (dbValues && dbValues.length > 0)
    ? dbValues.map(v => ({ icon: v.icon, title: v.title, body: v.description }))
    : fallbackValues;

  return (
    <section className="section-stack bg-canvas">
      <div className="container-aura">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Our Values</p>
          <TextBlurReveal
            as="h2"
            className="t-display-md c-ink leading-tight mb-4"
          >
            Four things we don&apos;t compromise on.
          </TextBlurReveal>
          <p className="t-body c-ink-muted">
            They shape what we make, who we make it with, and what we&apos;ll never
            put our name on.
          </p>
        </div>

        <RevealOnScroll stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {values.map((v) => {
            const Icon = getIcon(v.icon);
            return (
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
                  <Icon size={20} strokeWidth={1.25} className="c-ink" />
                </div>
                <h3 className="t-headline-sm c-ink mb-3">{v.title}</h3>
                <p className="t-body c-ink-muted leading-relaxed">{v.body}</p>
              </motion.div>
            );
          })}
        </RevealOnScroll>
      </div>
    </section>
  );
}

export default BrandValues;
