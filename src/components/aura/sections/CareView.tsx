"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { PageHero } from "@/components/aura/layout/PageHero";
import { useCareGuides } from "@/hooks/queries/use-content";
import type { CareGuide } from "@/types";

type CareGuideBlock = { type: "paragraph" | "heading" | "list"; text?: string; items?: string[] };

/**
 * CareView — library of seven material-specific care guides plus
 * a full article view for each one.
 */

export function CareView() {
  const { data: careGuides = [] } = useCareGuides();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const guide = careGuides.find((g) => g.slug === activeSlug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSlug]);

  return (
    <div className="bg-gradient-to-b from-canvas to-cream/20 min-h-screen">
      <AnimatePresence mode="wait">
        {guide ? (
          <GuideDetail
            key={`guide-${guide.slug}`}
            guide={guide}
            onBack={() => setActiveSlug(null)}
          />
        ) : (
          <GuideLibrary key="guide-library" onOpen={(slug) => setActiveSlug(slug)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Library index                                                              */
/* -------------------------------------------------------------------------- */

function GuideLibrary({ onOpen }: { onOpen: (slug: string) => void }) {
  const { data: careGuides = [] } = useCareGuides();
  return (
    <div>
      {/* Page hero — full-bleed image under fixed header */}
      <PageHero
        image="/hero/care.webp"
        alt="Care tools arranged on a linen cloth — a horsehair brush, microfiber cloth, beeswax polish, and a dried fern frond."
        eyebrow="Care"
        headline="Material Guides"
      />

      {/* Guide grid */}
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <RevealOnScroll
            stagger={0.07}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {careGuides.map((guide, i) => (
              <motion.button
                key={guide.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                onClick={() => onOpen(guide.slug)}
                className="group text-left bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6 md:p-8 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-full bg-gold-pale flex items-center justify-center">
                    <BookOpen size={18} strokeWidth={1.25} className="c-gold-deep" />
                  </div>
                  <span className="t-caption c-ink-faint t-num">
                    {String(i + 1).padStart(2, "0")} / {String(careGuides.length).padStart(2, "0")}
                  </span>
                </div>
                <p className="t-label-caps c-gold-deep mb-2">{guide.material}</p>
                <h3 className="t-headline-md c-ink leading-tight mb-3">
                  {guide.title}
                </h3>
                <p className="t-body-sm c-ink-muted leading-relaxed line-clamp-3 mb-5 flex-1">
                  {guide.excerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 t-label-caps c-ink group-hover:c-gold-deep transition-colors link-underline">
                  Read the guide
                  <ArrowRight
                    size={12}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </motion.button>
            ))}
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Full guide article                                                         */
/* -------------------------------------------------------------------------- */

function GuideDetail({
  guide,
  onBack,
}: {
  guide: CareGuide;
  onBack: () => void;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Back — padded for fixed header */}
      <section className="pt-24 md:pt-28 pb-6 md:pb-8">
        <div className="container-aura">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            All Care Guides
          </button>
        </div>
      </section>

      {/* Header */}
      <section className="relative overflow-hidden pb-8 md:pb-12">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full bg-gold-pale opacity-50 blur-3xl"
          aria-hidden
        />
        <div className="container-aura max-w-3xl relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            {guide.material}
          </p>
          <TextBlurReveal
            as="h1"
            className="t-display-md c-ink leading-tight mb-5"
          >
            {guide.title}
          </TextBlurReveal>
          <p className="t-body-lg c-ink-muted leading-relaxed">
            {guide.excerpt}
          </p>

          {/* Ornamental divider */}
          <div className="divider-ornament my-10">
            <span className="t-label-caps c-gold-deep">Care Notes</span>
          </div>
        </div>
      </section>

      {/* Body blocks */}
      <section className="pb-12 md:pb-16">
        <div className="container-aura max-w-3xl">
          <RevealOnScroll stagger={0.06} className="space-y-6">
            {guide.body.map((block, i) => (
              <GuideBlock key={i} block={block} />
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 md:pb-32">
        <div className="container-aura max-w-3xl">
          <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-8 md:p-10">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              Still stuck?
            </p>
            <h2 className="t-headline-md c-ink leading-tight mb-3">
              Write to our concierge.
            </h2>
            <p className="t-body c-ink-muted leading-relaxed mb-6 max-w-lg">
              Anna reads every message herself and writes back within one
              business day. No bots, no offshore support team.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:concierge@auraliving.com"
                className="inline-flex items-center gap-3 bg-ink c-paper t-label-caps px-6 py-3.5 hover:bg-gold-deep transition-colors rounded-sm"
              >
                Email the concierge
                <ArrowRight size={14} strokeWidth={1.5} />
              </a>
              <button
                onClick={() => router.push("/shop")}
                className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
              >
                Browse the shop
              </button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Body block renderer                                                        */
/* -------------------------------------------------------------------------- */

function GuideBlock({ block }: { block: CareGuideBlock }) {
  if (block.type === "heading") {
    return (
      <motion.h2
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
          },
        }}
        className="t-headline-md c-ink pt-4"
      >
        {block.text}
      </motion.h2>
    );
  }

  if (block.type === "paragraph") {
    return (
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
          },
        }}
        className="t-body-lg c-ink-muted leading-relaxed"
      >
        {block.text}
      </motion.p>
    );
  }

  // list
  return (
    <motion.ul
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
        },
      }}
      className="space-y-3 pl-1"
    >
      {block.items?.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <Check
            size={14}
            strokeWidth={2}
            className="c-gold-deep mt-1.5 flex-shrink-0"
            aria-hidden
          />
          <span className="t-body c-ink-muted leading-relaxed">{item}</span>
        </li>
      ))}
    </motion.ul>
  );
}

export default CareView;
