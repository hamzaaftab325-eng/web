"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useHeroSlides } from "@/hooks/queries/use-content";

const FALLBACK_SLIDES = [
  {
    image: "/hero/slide-1.webp",
    eyebrow: "New — The Plant Edit",
    headline: "Considered objects, considered home.",
    subtitle: "Warm minimalism, artisanal craft, lived-in elegance. A small atelier of lamps, mirrors, plants, and ceramics — sourced from workshops we know by name.",
    ctaLabel: "Shop the Collection",
    ctaAction: "shop" as const,
    alt: "A sun-warm living room with a brass arc lamp, an arched oak mirror, and ceramics arranged on a low shelf.",
  },
  {
    image: "/hero/slide-2.webp",
    eyebrow: "The Lighting Edit",
    headline: "Light, layered like afternoon sun.",
    subtitle: "Sculptural table lamps, smoky glass sconces, and linen pendants — each one thrown, blown, or sewn by hand, each one casting its own warmth.",
    ctaLabel: "Explore Lighting",
    ctaAction: "shop" as const,
    alt: "A curated console table with a sculptural ceramic table lamp, art books, a hand-painted ceramic pot, and a smoky glass wall sconce.",
  },
  {
    image: "/hero/slide-3.webp",
    eyebrow: "Quiet Corners",
    headline: "A room breathes where light rests.",
    subtitle: "A reading nook, a fiddle leaf, a single linen cushion — the small notes that finish a room, sourced slowly and made to outlast a season.",
    ctaLabel: "Browse the Shop",
    ctaAction: "shop" as const,
    alt: "A quiet reading nook by a tall window with a matte black sculptural desk lamp, a fiddle leaf fig in a ribbed terracotta planter, and a low oak bench.",
  },
  {
    image: "/hero/slide-4.webp",
    eyebrow: "The Shelf Edit",
    headline: "Small notes that finish a room.",
    subtitle: "Obsidian bookends, hand-painted ceramics, pressed botanicals, and beeswax tapers — the considered objects that turn a shelf into a still life.",
    ctaLabel: "Shop Accessories",
    ctaAction: "shop" as const,
    alt: "A warm minimalist shelf vignette with a hand-painted ceramic pot, art books with an obsidian bookend, a seagrass basket, and a pressed botanical frame.",
  },
];

const AUTOPLAY_MS = 7000;

type SlideData = {
  image: string;
  eyebrow: string;
  headline: string;
  subtitle: string;
  ctaLabel: string;
  ctaAction: string;
  alt: string;
};

interface HeroSliderProps {
  /** Server-side fetched slides. When provided, renders immediately — no spinner. */
  initialSlides?: SlideData[];
}

export function HeroSlider({ initialSlides }: HeroSliderProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  // Ref + scroll progress for scroll-driven parallax (Scale + Fade)
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Detect mobile — disable scroll parallax on small screens for performance
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const enableScrollParallax = !prefersReducedMotion && !isMobile;

  // Scroll-driven transforms — Scale + Fade pattern (the ONLY scale animation)
  // Image scales 1.0 → 1.20 as user scrolls past the hero
  // Content translates up 0 → -180px and fades 1 → 0
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.20]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.7, 0]);

  // Phase 2: Use server-fetched initialSlides when available (no spinner).
  // TanStack Query still runs in background for refetching, but starts with
  // server data so there's no loading state on first render.
  const { data: apiSlides, isLoading: slidesLoading, isError: slidesError } = useHeroSlides();

  // Determine which slides to show:
  // 1. If server provided initialSlides → use them (instant, no spinner)
  // 2. If TanStack Query has data → use it (refetched data)
  // 3. If query is still loading and no initialSlides → empty (show loader)
  // 4. If query errored or returned empty → fall back to FALLBACK_SLIDES
  const slides: SlideData[] = initialSlides && initialSlides.length > 0
    ? initialSlides
    : (!slidesLoading && !slidesError && apiSlides && apiSlides.length > 0)
      ? apiSlides as SlideData[]
      : (!slidesLoading && (slidesError || !apiSlides || apiSlides.length === 0))
        ? FALLBACK_SLIDES
        : [];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

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

  const slide = slides[index];

  // While slides are loading from the API, show a minimal placeholder
  // (prevents flash of stale fallback content)
  if (!slide) {
    return (
      <section
        className="relative h-[85vh] md:h-screen min-h-[640px] w-full overflow-hidden hero-bg flex items-center justify-center"
        aria-label="Hero"
      >
        <div className="aura-loader-ring aura-loader-lg" />
      </section>
    );
  }

  const words = slide.headline.split(" ");

  return (
    <section
      ref={sectionRef}
      className="relative h-[85vh] md:h-screen min-h-[640px] w-full overflow-hidden hero-bg"
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
            // Only scroll-driven parallax controls scale now (no Ken Burns).
            // Slides cross-fade via the parent motion.div opacity transition.
            style={enableScrollParallax ? { scale: scrollScale, willChange: "transform" } : undefined}
            className="w-full h-full object-cover"
            fetchPriority={index === 0 ? "high" : "low"}
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 hero-overlay-bias" />
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="relative z-10 container-aura h-full flex items-end pb-20 md:pb-32"
        style={enableScrollParallax ? { y: contentY, opacity: contentOpacity, willChange: "transform, opacity" } : undefined}
      >
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="t-label-caps hero-text-muted mb-5 flex items-center gap-2">
                <span className="w-6 h-px bg-gold" aria-hidden />
                {slide.eyebrow}
              </motion.p>

              <h1 className="t-display-xl hero-text leading-[1.05] mb-6">
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

              <motion.p initial={prefersReducedMotion ? false : { opacity: 0, y: 16, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }} className="t-body-lg hero-text-muted max-w-xl mb-10 leading-relaxed">
                {slide.subtitle}
              </motion.p>

              <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button onClick={() => router.push(slide.ctaAction || "/shop")} className="hero-cta-primary btn-hover-spacing group inline-flex items-center gap-3 t-label-caps px-8 py-4 rounded-sm">
                  {slide.ctaLabel}
                  <ArrowRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={() => router.push("/about")} className="btn-hover-underline-arrow inline-flex items-center t-label-caps hero-text border border-paper/40 px-8 py-4 rounded-sm">
                  Read Our Story
                  <span className="btn-arrow" aria-hidden>
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </span>
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="absolute bottom-8 right-4 md:right-8 z-20 flex items-center gap-6">
        <div className="hidden md:flex items-center gap-1">
          <button onClick={prev} aria-label="Previous slide" className="hero-control-btn w-10 h-10 flex items-center justify-center">
            <ArrowRight size={14} strokeWidth={1.5} className="rotate-180" />
          </button>
          <button onClick={next} aria-label="Next slide" className="hero-control-btn w-10 h-10 flex items-center justify-center">
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {slides.map((s, i) => {
            const isActive = i === index;
            return (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}: ${s.headline}`} aria-current={isActive} className="hero-slide-indicator group relative h-[3px] w-8 md:w-12 overflow-hidden">
                {isActive && !paused && !prefersReducedMotion && (
                  <motion.div key={`${index}-${paused}`} className="hero-slide-indicator-active absolute inset-0 progress-origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }} />
                )}
                {isActive && (paused || prefersReducedMotion) && <div className="hero-slide-indicator-active absolute inset-0" />}
              </button>
            );
          })}
        </div>

        <span className="hidden md:inline-block t-caption hero-text-muted t-num tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 hero-text">
        <span className="t-caption t-label-caps">Scroll</span>
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={16} strokeWidth={1.25} />
        </motion.span>
      </motion.div>
    </section>
  );
}

export default HeroSlider;
