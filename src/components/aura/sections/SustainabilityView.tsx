"use client";

import { motion } from "framer-motion";
import { Leaf, Hammer, Compass, Heart, ArrowRight, MapPin, Check } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";

/**
 * SustainabilityView — materials sourcing table, four commitment
 * cards, and a closing CTA. Warm gradient throughout.
 */

interface SourcingRow {
  material: string;
  origin: string;
  workshop: string;
  certified: string;
}

const SOURCING_ROWS: SourcingRow[] = [
  {
    material: "Stoneware clay",
    origin: "Barcelos, Portugal",
    workshop: "Mateus Ceramics Cooperative",
    certified: "ISO 14001 · Lead-free glazes",
  },
  {
    material: "Solid brass",
    origin: "Brescia, Italy",
    workshop: "Brescia Metalworks",
    certified: "Recycled-content 60% · RoHS",
  },
  {
    material: "Seagrass & jute",
    origin: "Dhaka, Bangladesh",
    workshop: "Dhaka Weaving Collective",
    certified: "Fair Trade Federation",
  },
  {
    material: "European flax linen",
    origin: "Normandy, France",
    workshop: "Dhaka Weaving Collective (sewing)",
    certified: "European Flax · Masters of Linen",
  },
  {
    material: "Living plants",
    origin: "Salem, Oregon",
    workshop: "Willamette Greenhouse",
    certified: "USDA Organic · neonicotinoid-free",
  },
  {
    material: "Marble & travertine",
    origin: "Carrara, Italy",
    workshop: "Atelier Pieri",
    certified: "Quarry-traced · ETICS verified",
  },
];

interface Commitment {
  icon: typeof Leaf;
  title: string;
  body: string;
}

const COMMITMENTS: Commitment[] = [
  {
    icon: Hammer,
    title: "Made by hand, in small batches.",
    body: "Every ceramic, every brass piece, every textile — thrown, welded, or woven by a person, not a machine. We visit every workshop at least once a year.",
  },
  {
    icon: Leaf,
    title: "Traced to the source.",
    body: "We publish the origin of every material — the clay, the brass, the linen — on each product page. Transparency isn't a marketing line for us; it's the whole brief.",
  },
  {
    icon: Compass,
    title: "Designed for a decade.",
    body: "We design out of trend cycles. Every piece is meant to live with you for ten years, not one season — and to age into something better than the day it arrived.",
  },
  {
    icon: Heart,
    title: "We answer our own emails.",
    body: "No bots, no offshore support team. Our concierge — Anna — reads every message herself. Write to us with anything. We'll write back.",
  },
];

export function SustainabilityView() {
  const setView = useUIStore((s) => s.setView);

  return (
    <div className="bg-gradient-to-b from-canvas to-cream/20 pt-[72px] md:pt-[88px] min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full bg-gold-pale opacity-60 blur-3xl"
          aria-hidden
        />
        <div className="container-aura relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            Sustainability
          </p>
          <TextBlurReveal
            as="h1"
            className="t-display-lg c-ink leading-[1.05] max-w-3xl mb-6"
          >
            Where every piece comes from.
          </TextBlurReveal>
          <TextBlurReveal
            as="p"
            delay={0.2}
            className="t-body-lg c-ink-muted max-w-xl"
          >
            We publish the origin of every material we use — the clay, the
            brass, the linen, the marble. Transparency isn't a marketing
            line for us; it's the whole brief.
          </TextBlurReveal>
        </div>
      </section>

      {/* Sourcing table */}
      <section className="pb-16 md:pb-24">
        <div className="container-aura">
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern overflow-hidden">
            {/* Table header (desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-cream-deep/60 border-b border-hairline-cream">
              <div className="col-span-3 t-label-caps c-ink-faint">Material</div>
              <div className="col-span-3 t-label-caps c-ink-faint">Source</div>
              <div className="col-span-3 t-label-caps c-ink-faint">Workshop</div>
              <div className="col-span-3 t-label-caps c-ink-faint">Certification</div>
            </div>

            {/* Rows */}
            <RevealOnScroll stagger={0.06} className="divide-y divide-hairline-cream">
              {SOURCING_ROWS.map((row) => (
                <motion.div
                  key={row.material}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
                    },
                  }}
                  className="md:grid md:grid-cols-12 md:gap-4 px-6 md:px-8 py-5 md:py-6 hover:bg-cream/60 transition-colors"
                >
                  {/* Mobile: stacked; Desktop: grid */}
                  <div className="md:col-span-3 mb-2 md:mb-0">
                    <p className="md:hidden t-label-caps c-ink-faint mb-1">Material</p>
                    <p className="t-headline-sm c-ink">{row.material}</p>
                  </div>
                  <div className="md:col-span-3 mb-2 md:mb-0">
                    <p className="md:hidden t-label-caps c-ink-faint mb-1">Source</p>
                    <p className="t-body c-ink-muted flex items-center gap-1.5">
                      <MapPin size={12} strokeWidth={1.5} className="c-gold-deep flex-shrink-0" />
                      {row.origin}
                    </p>
                  </div>
                  <div className="md:col-span-3 mb-2 md:mb-0">
                    <p className="md:hidden t-label-caps c-ink-faint mb-1">Workshop</p>
                    <p className="t-body c-ink-muted">{row.workshop}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="md:hidden t-label-caps c-ink-faint mb-1">Certification</p>
                    <p className="t-body-sm c-ink-muted leading-snug flex items-start gap-1.5">
                      <Check
                        size={13}
                        strokeWidth={2.5}
                        className="c-gold-deep flex-shrink-0 mt-0.5"
                        aria-hidden
                      />
                      <span>{row.certified}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </RevealOnScroll>
          </div>

          <p className="t-caption c-ink-faint mt-4 italic">
            All sourcing claims are independently verified by third-party
            auditors. The full audit reports are available on request —
            write to <span className="c-gold-deep">concierge@auraliving.com</span>.
          </p>
        </div>
      </section>

      {/* Commitments */}
      <section className="py-16 md:py-24 bg-cream/60">
        <div className="container-aura">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center justify-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              Our Commitments
              <span className="w-6 h-px bg-gold" aria-hidden />
            </p>
            <TextBlurReveal
              as="h2"
              className="t-display-md c-ink leading-tight"
            >
              Four principles, no compromise.
            </TextBlurReveal>
          </div>

          <RevealOnScroll
            stagger={0.1}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {COMMITMENTS.map((c, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-8 md:p-10"
              >
                <c.icon size={28} strokeWidth={1.25} className="c-gold-deep mb-5" />
                <h3 className="t-headline-sm c-ink mb-3">{c.title}</h3>
                <p className="t-body c-ink-muted leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* Metrics strip */}
      <section className="py-12 md:py-16">
        <div className="container-aura">
          <RevealOnScroll
            stagger={0.08}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {[
              { value: "11", label: "Workshops" },
              { value: "6", label: "Countries" },
              { value: "60%", label: "Recycled brass" },
              { value: "10y", label: "Design lifespan" },
            ].map((m) => (
              <motion.div
                key={m.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                className="text-center p-6 border border-hairline-cream rounded-sm bg-gradient-card-warm"
              >
                <p className="t-display-md c-gold-deep t-num mb-2">{m.value}</p>
                <p className="t-label-caps c-ink-faint">{m.label}</p>
              </motion.div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <div className="bg-ink c-paper p-10 md:p-16 text-center rounded-sm relative overflow-hidden">
            <div
              className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/30 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <TextBlurReveal
                as="h2"
                className="t-display-md c-paper leading-tight mb-5"
              >
                Read the full sourcing report.
              </TextBlurReveal>
              <TextBlurReveal
                as="p"
                delay={0.2}
                className="t-body-lg c-paper/70 max-w-xl mx-auto mb-8"
              >
                Our 2025 transparency report covers every workshop, every
                material, and every audit. Forty pages, no green-washing.
              </TextBlurReveal>
              <button
                onClick={() => setView("about")}
                className="group inline-flex items-center gap-3 bg-paper c-ink t-label-caps px-8 py-4 hover:bg-gold-deep hover:c-paper transition-colors rounded-sm"
              >
                Read the Report
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SustainabilityView;
