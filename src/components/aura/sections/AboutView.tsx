"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Hammer, Leaf, Compass, Heart } from "lucide-react";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { PageHero } from "@/components/aura/layout/PageHero";

export function AboutView() {
  const router = useRouter();

  return (
    <div className="bg-canvas">
      {/* Page hero — full-bleed image under fixed header */}
      <PageHero
        image="/hero/about.webp"
        alt="A ceramics workshop — hands shaping a vessel on the wheel."
        eyebrow="About"
        headline="Our Story"
      />

      {/* Narrative */}
      <section className="section-stack">
        <div className="container-aura max-w-3xl">
          <TextBlurReveal
            as="p"
            className="t-headline-md c-ink font-display italic leading-relaxed mb-12"
          >
            We started Aura Living in a converted garage in Lahore, Punjab,
            with a single arched mirror, a borrowed truck, and a list of
            workshops we wanted to visit.
          </TextBlurReveal>

          <RevealOnScroll stagger={0.1} className="space-y-8 t-body-lg c-ink-muted leading-relaxed">
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              Five years on, that list has grown — but the principles haven't
              moved. We design slowly. We source in person. We work with
              workshops we know by first name, and we put our name on only the
              pieces we'd live with ourselves. There is no factory line, no
              catalogue of best-sellers chasing trends. There is a small studio,
              a careful eye, and a belief that the objects we live with should
              be made to outlast a season.
            </motion.p>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              Our ceramics are thrown in small batches in northern Portugal and
              in a cooperative in Bangladesh. Our brass and steel are shaped in
              a family-run metal shop outside Brescia. Our plants are
              greenhouse-grown locally and shipped from our Lahore
              studio. Every material has a story, and we publish that sourcing
              index on every product page — because we believe you should know
              where the things in your home come from.
            </motion.p>
            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              We don't make furniture. We don't sell bedding or kitchen
              appliances. We make the small notes that finish a room — the lamp
              that makes a corner feel intentional, the mirror that opens a wall,
              the planter that lifts a single plant to sculpture. We do fewer
              things, more carefully. That is the whole idea.
            </motion.p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Image + caption block */}
      <section className="bg-cream py-16 md:py-24">
        <div className="container-aura">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7 aspect-[4/3] overflow-hidden bg-cream-deep"
            >
              <img
                src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&h=900&fit=crop&q=80"
                alt="A studio shelf with ceramics and brass pieces arranged like a still life."
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-5"
            >
              <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />The Workshop</p>
              <h2 className="t-headline-lg c-ink leading-tight mb-6">
                One studio. Three rooms. A single standard.
              </h2>
              <p className="t-body c-ink-muted leading-relaxed mb-8">
                Our Lahore studio is where every piece begins and ends —
                sketched, sampled, photographed, packed. We're a team of seven:
                two designers, two makers, a photographer, a concierge, and a
                dog. We answer every email ourselves. We wrap every shipment
                ourselves. And we still visit every workshop, at least once a
                year, in person.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Founded", value: "2021, Lahore PK" },
                  { label: "Workshops", value: "11 across 6 countries" },
                  { label: "Team", value: "7 humans, 1 dog" },
                  { label: "Pieces in catalogue", value: "24 — and growing slowly" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 py-3 border-b border-hairline"
                  >
                    <span className="t-label-caps c-ink-faint">{row.label}</span>
                    <span className="t-body c-ink">{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-stack">
        <div className="container-aura">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2"><span className="w-6 h-px bg-gold" aria-hidden />What We Believe</p>
            <TextBlurReveal
              as="h2"
              className="t-display-md c-ink leading-tight"
            >
              Four principles, no compromise.
            </TextBlurReveal>
          </div>

          <RevealOnScroll stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
            {[
              {
                icon: Hammer,
                title: "Made by hand, in small batches.",
                body: "Every ceramic, every brass piece, every textile — thrown, welded, or woven by a person, not a machine. We visit every workshop, at least once a year.",
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
            ].map((v, i) => (
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
                className="border border-hairline-cream p-8 hover:border-gold/40 transition-colors"
              >
                <v.icon size={24} strokeWidth={1.25} className="c-ink mb-5" />
                <h3 className="t-headline-sm c-ink mb-3">{v.title}</h3>
                <p className="t-body c-ink-muted leading-relaxed">{v.body}</p>
              </motion.div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="section-stack bg-ink c-paper">
        <div className="container-aura text-center max-w-2xl mx-auto">
          <TextBlurReveal
            as="h2"
            className="t-display-md c-paper leading-tight mb-6"
          >
            Browse the full catalogue.
          </TextBlurReveal>
          <TextBlurReveal
            as="p"
            delay={0.2}
            className="t-body-lg c-paper/70 mb-10"
          >
            Twenty-four considered pieces, across six categories. Start with the
            ones that catch your eye.
          </TextBlurReveal>
          <button
            onClick={() => router.push("/shop")}
            className="group inline-flex items-center gap-3 bg-paper c-ink t-label-caps px-6 py-3.5 hover:bg-gold-deep hover:c-paper transition-colors rounded-sm"
          >
            Explore the Shop
            <ArrowRight
              size={14}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </section>
    </div>
  );
}

export default AboutView;
