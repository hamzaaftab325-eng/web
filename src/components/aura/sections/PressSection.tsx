"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ArrowUpRight } from "lucide-react";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { cn } from "@/lib/utils";

/**
 * PressSection — "As Seen In" feature with five publications.
 *
 * Hovering (or focusing) a publication reveals the corresponding
 * quote in a dark popover, with a "Read the feature" link to the
 * mock press article (opens in a new tab). Designed to drop into
 * any marketing surface.
 */

interface PressItem {
  id: string;
  publication: string;
  /** Year the feature ran. */
  year: string;
  /** Short tagline shown beneath the publication name. */
  tagline: string;
  /** The full quote revealed on hover. */
  quote: string;
  /** Author of the quote. */
  author: string;
  /** Author role / context. */
  authorRole: string;
  /** Mock URL to the press feature article (opens in new tab). */
  featureUrl: string;
}

const PRESS_ITEMS: PressItem[] = [
  {
    id: "press-01",
    publication: "Architectural Digest",
    year: "2025",
    tagline: "Featured in the AD100 issue",
    quote:
      "Aura Living is doing the rarest thing in home goods right now — making objects slowly, naming the people who make them, and refusing to chase a trend. Their arched mirror is on my shortlist for every project.",
    author: "Mara Henderson",
    authorRole: "AD100 Designer",
    featureUrl: "https://www.architecturaldigest.com/story/aura-living-ad100-2025",
  },
  {
    id: "press-02",
    publication: "Vogue Living",
    year: "2025",
    tagline: "Spring edit, 'Quiet Rooms'",
    quote:
      "The Halo lamp is the only object I've bought this year that's stopped me in the hallway every evening since. There is something about that matte glaze and the honeyed light that no photograph has quite captured.",
    author: "Elise Moreau",
    authorRole: "Decor Editor",
    featureUrl: "https://www.vogue.com/article/aura-living-quiet-rooms-spring-2025",
  },
  {
    id: "press-03",
    publication: "Kinfolk",
    year: "2024",
    tagline: "Profile, 'The Slow Makers'",
    quote:
      "What's remarkable about Aura Living isn't the catalogue — it's the sourcing index. Every piece has a workshop, a name, and a story attached. It's the kind of transparency we should expect from everyone, and almost no one offers.",
    author: "Theo Lindqvist",
    authorRole: "Contributing Writer",
    featureUrl: "https://kinfolk.com/aura-living-slow-makers-profile",
  },
  {
    id: "press-04",
    publication: "Dwell",
    year: "2024",
    tagline: "Best of the Year, Lighting",
    quote:
      "The Brass Arc Floor Lamp is a single three-metre sweep of solid brass, bent cold in a press built in 1962. There is nothing else in its price range that's made this way — and very little above it, either.",
    author: "Jonah Park",
    authorRole: "Senior Editor",
    featureUrl: "https://www.dwell.com/article/brass-arc-floor-lamp-best-of-the-year",
  },
  {
    id: "press-05",
    publication: "Apartment Therapy",
    year: "2024",
    tagline: "Small Cool, 'Best Small Object'",
    quote:
      "The hand-painted ceramic pot is twelve dollars more than the version at the big-box store, and it's worth ten times that. It's thrown by a person. It has a maker's mark. It will outlast the plant that lives in it.",
    author: "Carla Ng",
    authorRole: "Style Editor",
    featureUrl: "https://www.apartmenttherapy.com/aura-living-hand-painted-ceramic-pot-best-small-object",
  },
];

export function PressSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="section-stack bg-cream/60">
      <div className="container-aura">
        {/* Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-gold" aria-hidden />
            As Seen In
          </p>
          <TextBlurReveal
            as="h2"
            className="t-display-md c-ink leading-tight"
          >
            The press, on Aura.
          </TextBlurReveal>
        </div>

        {/* Publication grid */}
        <RevealOnScroll
          stagger={0.08}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {PRESS_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                onMouseEnter={() => setActiveId(item.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(item.id)}
                onBlur={() => setActiveId(null)}
                tabIndex={0}
                className="relative bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-8 md:p-10 min-h-[260px] flex flex-col justify-between cursor-default outline-none"
              >
                {/* Default state — publication name */}
                <div
                  className={cn(
                    "transition-opacity duration-300",
                    isActive ? "opacity-0" : "opacity-100"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4 mb-6">
                    <span className="t-caption c-ink-faint t-num">{item.year}</span>
                    <Quote
                      size={18}
                      strokeWidth={1}
                      className="c-gold-deep/60"
                    />
                  </div>
                  <h3 className="t-display-md c-ink leading-tight font-display italic">
                    {item.publication}
                  </h3>
                  <p className="t-body-sm c-ink-muted mt-3">{item.tagline}</p>
                  <p className="t-label-caps c-ink-faint mt-5 flex items-center gap-1.5">
                    <ArrowUpRight size={11} strokeWidth={1.5} />
                    Read the {item.year} feature
                  </p>
                </div>

                {/* Hover quote popover (dark, in-place) */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-ink c-paper p-8 md:p-10 rounded-sm flex flex-col justify-between"
                    >
                      <div>
                        <Quote
                          size={24}
                          strokeWidth={1}
                          className="c-gold mb-4"
                        />
                        <p className="t-body-lg c-paper leading-relaxed font-display italic mb-5">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="t-headline-sm c-paper">{item.author}</p>
                          <p className="t-caption c-paper/60">{item.authorRole}</p>
                        </div>
                        <a
                          href={item.featureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 t-label-caps c-gold-deep hover:c-paper transition-colors link-underline"
                        >
                          Read the feature
                          <ArrowUpRight size={12} strokeWidth={1.5} />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Press outreach card (not a publication) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
              },
            }}
            className="bg-ink c-paper p-8 md:p-10 rounded-sm flex flex-col justify-between min-h-[260px]"
          >
            <div>
              <p className="t-label-caps c-gold mb-4">Press &amp; partnerships</p>
              <h3 className="t-headline-md c-paper leading-tight mb-3">
                Writing about Aura?
              </h3>
              <p className="t-body-sm c-paper/70 leading-relaxed">
                We keep a press kit with high-resolution imagery, the sourcing
                index, and founder bios. Anna will send it within the day.
              </p>
            </div>
            <a
              href="mailto:press@auraliving.com"
              className="inline-flex items-center gap-2 t-label-caps c-paper hover:c-gold-deep transition-colors link-underline mt-6"
            >
              press@auraliving.com
            </a>
          </motion.div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

export default PressSection;
