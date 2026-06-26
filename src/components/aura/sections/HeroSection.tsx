"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { SplitTextReveal } from "@/components/aura/animation/SplitTextReveal";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";

export function HeroSection() {
  const setView = useUIStore((s) => s.setView);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative h-[85vh] md:h-screen min-h-[640px] flex items-end overflow-hidden bg-ink"
      aria-label="Hero"
    >
      {/* Background image with subtle parallax */}
      <motion.div
        initial={prefersReducedMotion ? false : { scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <img
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1920&h=1080&fit=crop&q=80"
          alt="A sun-warm living room with a brass arc lamp, an arched oak mirror, and ceramics arranged on a low shelf."
          className="w-full h-full object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container-aura pb-20 md:pb-32">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="t-label-caps c-gold mb-6"
          >
            New — The Plant Edit
          </motion.p>

          <SplitTextReveal
            as="h1"
            text="Considered objects for the considered home."
            splitBy="line"
            stagger={0.12}
            duration={0.9}
            trigger="mount"
            delay={0.4}
            className="t-display-xl c-paper leading-[1.05] mb-6"
          />

          <TextBlurReveal
            as="p"
            duration={1}
            delay={1.1}
            trigger="mount"
            className="t-body-lg c-paper/80 max-w-xl mb-10 leading-relaxed"
          >
            Warm minimalism, artisanal craft, lived-in elegance. A small atelier
            of lamps, mirrors, plants, and ceramics — sourced from workshops we
            know by name.
          </TextBlurReveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <button
              onClick={() => setView("shop")}
              className="group inline-flex items-center gap-3 bg-paper c-ink t-label-caps px-8 py-4 hover:bg-gold transition-colors"
            >
              Shop the Collection
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <button
              onClick={() => setView("about")}
              className="inline-flex items-center gap-2 t-label-caps c-paper hover:c-gold transition-colors link-underline"
            >
              Read Our Story
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 c-paper/60"
      >
        <span className="t-caption t-label-caps">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} strokeWidth={1.25} />
        </motion.span>
      </motion.div>
    </section>
  );
}

export default HeroSection;
