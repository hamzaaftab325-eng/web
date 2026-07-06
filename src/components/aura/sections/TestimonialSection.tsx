"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useTestimonials } from "@/hooks/queries/use-content";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { cn } from "@/lib/utils";

interface TestimonialSectionProps {
  initialTestimonials?: Awaited<ReturnType<typeof import("@/lib/services/content.service").getTestimonials>>;
}

export function TestimonialSection({ initialTestimonials }: TestimonialSectionProps = {}) {
  const { data: testimonials = initialTestimonials ?? [] } = useTestimonials();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || paused || prefersReducedMotion) return;
    const id = setInterval(() => emblaApi.scrollNext(), 5500);
    return () => clearInterval(id);
  }, [emblaApi, paused, prefersReducedMotion]);

  // Bug #26: Don't render the section at all if there are no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section
      className="section-stack bg-cream-deep"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-aura">
        <div className="text-center mb-12 md:mb-16">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Kind Words</p>
          <TextBlurReveal
            as="h2"
            className="t-display-md c-ink leading-tight"
          >
            What our customers say.
          </TextBlurReveal>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="flex-[0_0_100%] md:flex-[0_0_60%] md:pl-[20%] pr-4"
                >
                  {/* AnimatePresence reanimates the quote block when the slide changes */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selected}
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="text-center md:text-left"
                    >
                      <span
                        className="t-display-lg c-gold/40 font-display italic leading-none block mb-6"
                        aria-hidden
                      >
                        “
                      </span>
                      <p className="t-headline-md c-ink font-display italic font-light leading-relaxed mb-8 max-w-3xl mx-auto md:mx-0">
                        {t.quote}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            strokeWidth={1.25}
                            className={cn(
                              i < t.rating ? "fill-gold c-gold" : "c-ink-faint"
                            )}
                          />
                        ))}
                      </div>
                      <p className="t-label-caps c-ink">{t.name}</p>
                      <p className="t-caption c-ink-faint mt-1">{t.location}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous testimonial"
              className="p-2 c-ink hover:c-gold transition-colors"
            >
              <ChevronLeft size={22} strokeWidth={1.25} />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={cn(
                    "h-1 transition-all duration-300",
                    selected === i ? "w-8 bg-ink" : "w-4 bg-ink/20 hover:bg-ink/40"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next testimonial"
              className="p-2 c-ink hover:c-gold transition-colors"
            >
              <ChevronRight size={22} strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;
