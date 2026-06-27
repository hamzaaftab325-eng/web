"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    image: "/hero/slide-1.png",
    eyebrow: "New — The Plant Edit",
    headline: "Considered objects for the considered home.",
    subtitle: "Warm minimalism, artisanal craft, lived-in elegance. A small atelier of lamps, mirrors, plants, and ceramics — sourced from workshops we know by name.",
    ctaLabel: "Shop the Collection",
    ctaAction: "shop" as const,
    alt: "A sun-warm living room with a brass arc lamp, an arched oak mirror, and ceramics arranged on a low shelf.",
  },
  {
    image: "/hero/slide-2.png",
    eyebrow: "The Lighting Edit",
    headline: "Light, layered like afternoon sun.",
    subtitle: "Sculptural table lamps, smoky glass sconces, and linen pendants — each one thrown, blown, or sewn by hand, each one casting its own warmth.",
    ctaLabel: "Explore Lighting",
    ctaAction: "shop" as const,
    alt: "A curated console table with a sculptural ceramic table lamp, art books, a hand-painted ceramic pot, and a smoky glass wall sconce.",
  },
  {
    image: "/hero/slide-3.png",
    eyebrow: "Quiet Corners",
    headline: "A room breathes where light rests.",
    subtitle: "A reading nook, a fiddle leaf, a single linen cushion — the small notes that finish a room, sourced slowly and made to outlast a season.",
    ctaLabel: "Browse the Shop",
    ctaAction: "shop" as const,
    alt: "A quiet reading nook by a tall window with a matte black sculptural desk lamp, a fiddle leaf fig in a ribbed terracotta planter, and a low oak bench.",
  },
  {
    image: "/hero/slide-4.png",
    eyebrow: "The Shelf Edit",
    headline: "Small notes that finish a room.",
    subtitle: "Obsidian bookends, hand-painted ceramics, pressed botanicals, and beeswax tapers — the considered objects that turn a shelf into a still life.",
    ctaLabel: "Shop Accessories",
    ctaAction: "shop" as const,
    alt: "A warm minimalist shelf vignette with a hand-painted ceramic pot, art books with an obsidian bookend, a seagrass basket, and a pressed botanical frame.",
  },
];

const AUTOPLAY_MS = 7000;

export function HeroSlider() {
  const setView = useUIStore((s) => s.setView);
  const prefersReducedMotion = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused || prefersReducedMotion) return;
    const timer = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, prefersReducedMotion, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = SLIDES[index];
  const words = slide.headline.split(" ");

  return (
    <section
      className="relative h-[85vh] md:h-screen min-h-[640px] w-full overflow-hidden bg-cream-deep"
      aria-label="Hero"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <motion.img
            src={slide.image}
            alt={slide.alt}
            initial={prefersReducedMotion ? false : { scale: 1.08 }}
            animate={prefersReducedMotion ? { scale: 1 } : { scale: 1.16 }}
            exit={{ scale: 1.16 }}
            transition={{ duration: AUTOPLAY_MS / 1000 + 1.4, ease: "linear" }}
            className={cn("w-full h-full object-cover", !prefersReducedMotion && "slider-image-active")}
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 hero-overlay-bias" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container-aura h-full flex items-end pb-20 md:pb-32">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="t-label-caps c-paper mb-5 flex items-center gap-2">
                <span className="w-6 h-px bg-gold" aria-hidden />
                {slide.eyebrow}
              </motion.p>

              <h1 className="t-display-xl c-paper leading-[1.05] mb-6">
                {prefersReducedMotion ? (
                  slide.headline
                ) : (
                  <motion.span initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } }} className="inline-block">
                    {words.map((word, i) => (
                      <span key={i} className="inline-block overflow-hidden mr-[0.28em] align-bottom">
                        <motion.span className="inline-block" variants={{ hidden: { y: "110%", opacity: 0, filter: "blur(12px)" }, visible: { y: "0%", opacity: 1, filter: "blur(0px)", transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const } } }}>
                          {word}
                        </motion.span>
                      </span>
                    ))}
                  </motion.span>
                )}
              </h1>

              <motion.p initial={prefersReducedMotion ? false : { opacity: 0, y: 16, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }} className="t-body-lg c-paper max-w-xl mb-10 leading-relaxed">
                {slide.subtitle}
              </motion.p>

              <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button onClick={() => setView(slide.ctaAction)} className="group inline-flex items-center gap-3 bg-paper c-ink t-label-caps px-8 py-4 hover:bg-gold-deep hover:c-paper transition-colors rounded-sm">
                  {slide.ctaLabel}
                  <ArrowRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={() => setView("about")} className="inline-flex items-center gap-2 t-label-caps c-paper hover:c-gold-deep transition-colors link-underline">
                  Read Our Story
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-4 md:right-8 z-20 flex items-center gap-6">
        <div className="hidden md:flex items-center gap-1">
          <button onClick={prev} aria-label="Previous slide" className="w-10 h-10 flex items-center justify-center c-paper/70 hover:c-paper transition-colors border border-paper/20 hover:border-paper/60 rounded-sm">
            <ArrowRight size={14} strokeWidth={1.5} className="rotate-180" />
          </button>
          <button onClick={next} aria-label="Next slide" className="w-10 h-10 flex items-center justify-center c-paper/70 hover:c-paper transition-colors border border-paper/20 hover:border-paper/60 rounded-sm">
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {SLIDES.map((s, i) => {
            const isActive = i === index;
            return (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}: ${s.headline}`} aria-current={isActive} className="group relative h-[3px] w-8 md:w-12 bg-paper/25 overflow-hidden">
                {isActive && !paused && !prefersReducedMotion && (
                  <motion.div key={`${index}-${paused}`} className="absolute inset-0 bg-paper progress-origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }} />
                )}
                {isActive && (paused || prefersReducedMotion) && <div className="absolute inset-0 bg-paper" />}
              </button>
            );
          })}
        </div>

        <span className="hidden md:inline-block t-caption c-paper/70 t-num tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 c-paper">
        <span className="t-caption t-label-caps">Scroll</span>
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={16} strokeWidth={1.25} />
        </motion.span>
      </motion.div>
    </section>
  );
}

export default HeroSlider;
