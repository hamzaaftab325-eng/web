"use client";

import { Instagram } from "lucide-react";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { motion } from "framer-motion";

const feedImages = [
  "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=600&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=600&h=600&fit=crop&q=80",
];

export function InstagramFeed() {
  return (
    <section className="section-stack bg-canvas">
      <div className="container-aura">
        <div className="text-center mb-12 md:mb-16">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />Follow along</p>
          <TextBlurReveal
            as="h2"
            className="t-display-md c-ink leading-tight mb-4"
          >
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-baseline gap-2 hover:c-gold transition-colors link-underline"
            >
              <Instagram size={28} strokeWidth={1.25} className="self-center" />
              @auraliving
            </a>
          </TextBlurReveal>
          <p className="t-body c-ink-muted max-w-md mx-auto">
            Slow rooms, soft light, and the objects that finish them — shared
            daily.
          </p>
        </div>

        <RevealOnScroll stagger={0.06} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          {feedImages.map((src, i) => (
            <motion.a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                },
              }}
              className="group relative aspect-square overflow-hidden bg-cream"
            >
              <img
                src={src}
                alt={`Aura Living Instagram post ${i + 1} — home décor inspiration`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.08]"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-500 flex items-center justify-center">
                <Instagram
                  size={26}
                  strokeWidth={1.25}
                  className="c-paper opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </motion.a>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}

export default InstagramFeed;
