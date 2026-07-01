"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useUIStore } from "@/store/use-ui-store";
import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { RevealOnScroll } from "@/components/aura/animation/RevealOnScroll";
import { PageHero } from "@/components/aura/layout/PageHero";
import { useArticles } from "@/hooks/queries/use-content";

/**
 * Map each visual card to one of the two fully-written journal articles.
 * The cards without a full article yet fall back to the closest topical
 * match so the JournalReader overlay is always reachable from the index.
 */

const articles = [
  {
    id: "1",
    title: "On Lighting a Room Without Overhead Light",
    excerpt:
      "Why the best rooms are lit from below — and how to layer three sources of light into a single corner that reads as warmth, not work.",
    category: "Lighting",
    date: "March 12, 2026",
    readTime: "6 min",
    image:
      "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "2",
    title: "How to Choose a Mirror That Opens a Wall",
    excerpt:
      "A practical guide to arches, scales, and frames — and the three placements that consistently transform an awkward wall.",
    category: "Mirrors",
    date: "February 27, 2026",
    readTime: "5 min",
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "3",
    title: "The Slow Plants — Five Specimens That Outlast a Trend",
    excerpt:
      "Snake plants, monsteras, and the unfussy few that have outlived three decades of indoor-plant fads. Care notes included.",
    category: "Plants",
    date: "February 9, 2026",
    readTime: "8 min",
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "4",
    title: "A Visit to the Brescia Metal Workshop",
    excerpt:
      "Notes from a week with the family that shapes our brass — three generations, one forge, and an obsessive standard for patina.",
    category: "Workshops",
    date: "January 22, 2026",
    readTime: "10 min",
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "5",
    title: "On Caring for Brass — and Letting It Age",
    excerpt:
      "Why we seal some brass pieces and leave others raw — and how to decide whether to polish, patina, or simply let time do the work.",
    category: "Materials",
    date: "January 4, 2026",
    readTime: "4 min",
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=600&fit=crop&q=80",
  },
  {
    id: "6",
    title: "Building a Room Around a Single Object",
    excerpt:
      "A short essay on the discipline of starting with one piece — a lamp, a mirror, a vessel — and building the rest of the room around it.",
    category: "Design Notes",
    date: "December 18, 2025",
    readTime: "7 min",
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=600&fit=crop&q=80",
  },
];

export function JournalView() {
  const router = useRouter();
  const openArticle = useUIStore((s) => s.openArticle);
  const { data: journalArticles = [] } = useArticles();

  return (
    <div className="bg-canvas">
      {/* Page hero — full-bleed image under fixed header */}
      <PageHero
        image="/hero/journal.webp"
        alt="An editor's desk with an open notebook, fountain pen, and a small ceramic vase of dried flowers."
        eyebrow="Journal"
        headline="Notes & Essays"
      />

      {/* Featured article */}
      <section className="py-12 md:py-20">
        <div className="container-aura">
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center text-left w-full"
            onClick={() => openArticle(journalArticles[0]?.slug ?? "")}
          >
            <div className="md:col-span-7 aspect-[16/10] overflow-hidden bg-cream">
              <img
                src={articles[0].image}
                alt={articles[0].title}
                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="t-label-caps c-gold-deep">{articles[0].category}</span>
                <span className="t-caption c-ink-faint">·</span>
                <span className="t-caption c-ink-faint">
                  {articles[0].readTime} read
                </span>
              </div>
              <h2 className="t-display-md c-ink leading-tight mb-5 group-hover:c-gold transition-colors">
                {articles[0].title}
              </h2>
              <p className="t-body-lg c-ink-muted leading-relaxed mb-6">
                {articles[0].excerpt}
              </p>
              <span className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold transition-colors link-underline">
                Read the Essay
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>
          </motion.button>
        </div>
      </section>

      {/* Article grid */}
      <section className="pb-20 md:pb-32">
        <div className="container-aura">
          <div className="flex items-baseline justify-between mb-10 md:mb-12">
            <h2 className="t-headline-lg c-ink">More from the Journal</h2>
            <p className="t-caption c-ink-faint t-num">{articles.length - 1} essays</p>
          </div>

          <RevealOnScroll stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {articles.slice(1).map((article, i) => (
              <motion.button
                key={article.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
                  },
                }}
                onClick={() => openArticle(journalArticles[(i + 1) % Math.max(journalArticles.length, 1)]?.slug ?? "")}
                className="group text-left"
              >
                <div className="aspect-[4/3] overflow-hidden bg-cream mb-5">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.05]"
                  />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="t-label-caps c-gold-deep">{article.category}</span>
                  <span className="t-caption c-ink-faint">·</span>
                  <span className="t-caption c-ink-faint">{article.date}</span>
                </div>
                <h3 className="t-headline-sm c-ink mb-2 group-hover:c-gold transition-colors">
                  {article.title}
                </h3>
                <p className="t-body-sm c-ink-muted leading-relaxed mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
                <span className="inline-flex items-center gap-1.5 t-caption c-ink group-hover:c-gold transition-colors">
                  Read more
                  <ArrowUpRight size={12} strokeWidth={1.5} />
                </span>
              </motion.button>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream py-16 md:py-24">
        <div className="container-aura text-center max-w-xl mx-auto">
          <TextBlurReveal
            as="h2"
            className="t-headline-lg c-ink leading-tight mb-5"
          >
            Read with us, monthly.
          </TextBlurReveal>
          <TextBlurReveal
            as="p"
            delay={0.2}
            className="t-body c-ink-muted mb-8"
          >
            One essay a month. Workshop visits, care guides, design notes —
            never marketing.
          </TextBlurReveal>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold transition-colors link-underline"
          >
            Back to Home
          </button>
        </div>
      </section>
    </div>
  );
}

export default JournalView;
