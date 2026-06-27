"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin, Hammer, Calendar } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { ProductCard } from "@/components/aura/commerce/ProductCard";
import { artisans, artisanBySlug } from "@/data/artisans";
import { products } from "@/data/products";
import type { Artisan } from "@/data/artisans";

/**
 * ArtisansView — index of four workshop profiles plus a full
 * detail view with story, gallery, and linked products.
 */

const productBySlug = (slug: string) => products.find((p) => p.slug === slug);

// Split a story string into roughly equal paragraphs at sentence
// boundaries so the detail view reads with editorial rhythm.
function storyParagraphs(story: string): string[] {
  const sentences = story.match(/[^.!?]+[.!?]+/g) ?? [story];
  if (sentences.length <= 2) return [story];
  const mid = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, mid).join(" "), sentences.slice(mid).join(" ")];
}

export function ArtisansView() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const artisan = activeSlug ? artisanBySlug(activeSlug) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSlug]);

  return (
    <div className="bg-gradient-to-b from-canvas to-cream/20 pt-[72px] md:pt-[88px] min-h-screen">
      <AnimatePresence mode="wait">
        {artisan ? (
          <ArtisanDetail
            key={`artisan-${artisan.slug}`}
            artisan={artisan}
            onBack={() => setActiveSlug(null)}
          />
        ) : (
          <ArtisanIndex key="artisan-index" onOpen={(slug) => setActiveSlug(slug)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Index                                                                      */
/* -------------------------------------------------------------------------- */

function ArtisanIndex({ onOpen }: { onOpen: (slug: string) => void }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full bg-gold-pale opacity-60 blur-3xl"
          aria-hidden
        />
        <div className="container-aura relative">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            The Workshops
          </p>
          <TextBlurReveal
            as="h1"
            className="t-display-lg c-ink leading-[1.05] max-w-3xl mb-6"
          >
            The hands behind the pieces.
          </TextBlurReveal>
          <TextBlurReveal
            as="p"
            delay={0.2}
            className="t-body-lg c-ink-muted max-w-xl"
          >
            Four workshops, six countries, one shared standard. Every Aura
            piece is made by a person we know by name.
          </TextBlurReveal>
        </div>
      </section>

      {/* Profile grid */}
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <RevealOnScroll
            stagger={0.1}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {artisans.map((artisan) => (
              <motion.button
                key={artisan.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                onClick={() => onOpen(artisan.slug)}
                className="group text-left bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep ring-1 ring-hairline-cream group-hover:ring-hairline-gold transition-shadow">
                  <img
                    src={artisan.image}
                    alt={artisan.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="chip bg-paper/90 c-ink border-0 backdrop-blur-sm">
                      {artisan.craft}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="t-label-caps c-paper/80 mb-1 flex items-center gap-1.5">
                      <MapPin size={11} strokeWidth={1.5} />
                      {artisan.location}
                    </p>
                    <h3 className="t-headline-md c-paper leading-tight">
                      {artisan.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="t-label-caps c-ink-faint flex items-center gap-1.5">
                      <Calendar size={11} strokeWidth={1.5} />
                      Founded {artisan.founded}
                    </span>
                    <span className="t-caption c-ink-faint t-num">
                      {artisan.productSlugs.length} pieces
                    </span>
                  </div>
                  <p className="t-body-sm c-ink-muted leading-relaxed line-clamp-2 mb-4">
                    {artisan.story}
                  </p>
                  <span className="inline-flex items-center gap-1.5 t-label-caps c-ink group-hover:c-gold-deep transition-colors link-underline">
                    Read the workshop story
                    <ArrowRight
                      size={12}
                      strokeWidth={1.5}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </motion.button>
            ))}
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail                                                                     */
/* -------------------------------------------------------------------------- */

function ArtisanDetail({
  artisan,
  onBack,
}: {
  artisan: Artisan;
  onBack: () => void;
}) {
  const setView = useUIStore((s) => s.setView);

  const linkedProducts = artisan.productSlugs
    .map((slug) => productBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const paragraphs = storyParagraphs(artisan.story);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Back */}
      <section className="py-6 md:py-8">
        <div className="container-aura">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            All Workshops
          </button>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden pb-12 md:pb-16">
        <div
          className="pointer-events-none absolute -top-24 right-0 w-[360px] h-[360px] rounded-full bg-gold-pale opacity-50 blur-3xl"
          aria-hidden
        />
        <div className="container-aura relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 aspect-[4/3] overflow-hidden bg-cream-deep rounded-sm ring-1 ring-hairline-cream"
            >
              <img
                src={artisan.image}
                alt={artisan.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="t-label-caps c-gold-deep">{artisan.craft}</span>
                <span className="w-8 h-px bg-gold/40" aria-hidden />
              </div>
              <TextBlurReveal
                as="h1"
                className="t-display-md c-ink leading-tight mb-5"
              >
                {artisan.name}
              </TextBlurReveal>

              <div className="space-y-3 mb-8">
                <div className="flex items-baseline justify-between gap-4 py-2 border-b border-hairline">
                  <span className="t-label-caps c-ink-faint flex items-center gap-2">
                    <MapPin size={12} strokeWidth={1.5} />
                    Location
                  </span>
                  <span className="t-body c-ink">{artisan.location}</span>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2 border-b border-hairline">
                  <span className="t-label-caps c-ink-faint flex items-center gap-2">
                    <Calendar size={12} strokeWidth={1.5} />
                    Founded
                  </span>
                  <span className="t-body c-ink t-num">{artisan.founded}</span>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2 border-b border-hairline">
                  <span className="t-label-caps c-ink-faint flex items-center gap-2">
                    <Hammer size={12} strokeWidth={1.5} />
                    Craft
                  </span>
                  <span className="t-body c-ink">{artisan.craft}</span>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2 border-b border-hairline">
                  <span className="t-label-caps c-ink-faint">In catalogue</span>
                  <span className="t-body c-ink t-num">
                    {artisan.productSlugs.length} pieces
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="pb-16 md:pb-24 bg-cream/60">
        <div className="container-aura py-12 md:py-20">
          <div className="max-w-3xl mx-auto">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gold" aria-hidden />
              Their Story
            </p>
            <RevealOnScroll stagger={0.1} className="space-y-6 t-body-lg c-ink-muted leading-relaxed">
              {paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                    },
                  }}
                  className={i === 0 ? "t-headline-sm c-ink font-display italic leading-relaxed" : ""}
                >
                  {para}
                </motion.p>
              ))}
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 md:py-20">
        <div className="container-aura">
          <div className="flex items-baseline justify-between mb-8 md:mb-10">
            <h2 className="t-headline-lg c-ink">From the Workshop</h2>
            <p className="t-caption c-ink-faint t-num">
              {artisan.gallery.length} photographs
            </p>
          </div>

          <RevealOnScroll
            stagger={0.08}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
          >
            {artisan.gallery.map((src, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                className="overflow-hidden bg-cream-deep rounded-sm aspect-square ring-1 ring-hairline-cream hover:ring-hairline-gold transition-shadow"
              >
                <img
                  src={src}
                  alt={`${artisan.name} — gallery image ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </motion.div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* Linked products */}
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <div className="flex items-baseline justify-between mb-8 md:mb-10">
            <h2 className="t-headline-lg c-ink">Pieces by {artisan.name}</h2>
            <p className="t-caption c-ink-faint t-num">
              {linkedProducts.length} pieces
            </p>
          </div>

          <RevealOnScroll
            stagger={0.08}
            className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10"
          >
            {linkedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </RevealOnScroll>

          <div className="mt-16 md:mt-20 text-center">
            <button
              onClick={() => setView("shop")}
              className="inline-flex items-center gap-3 bg-ink c-paper t-label-caps px-8 py-4 hover:bg-gold-deep transition-colors rounded-sm"
            >
              Browse the full shop
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default ArtisansView;
