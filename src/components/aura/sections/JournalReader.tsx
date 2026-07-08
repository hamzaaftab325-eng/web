"use client";

import { useEffect, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Clock, Calendar } from "lucide-react";

import { useArticles } from "@/hooks/queries/use-content";
import { useProductsBySlugs } from "@/hooks/queries/use-product-by-slug";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { formatPrice } from "@/lib/utils";
import { useUIStore } from "@/store/use-ui-store";
import type { JournalBodyBlock } from "@/types";

/**
 * JournalReader — full-screen overlay article reader.
 */
export function JournalReader() {
  const activeSlug = useUIStore((s) => s.activeArticleSlug);
  const openArticle = useUIStore((s) => s.openArticle);
  const openProduct = useUIStore((s) => s.openProduct);

  const { data: articles = [] } = useArticles();
  const article = activeSlug ? articles.find((a) => a.slug === activeSlug) : undefined;
  const containerRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(containerRef, Boolean(article));

  // Esc to close + body scroll lock while the reader is open.
  useEffect(() => {
    if (!article) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") openArticle(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [article, openArticle]);

  return (
    <AnimatePresence>
      {article && (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${article.title} — full article`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[1100] bg-canvas overflow-y-auto scrollbar-thin"
        >
          {/* Sticky top bar with close + breadcrumb */}
          <div className="sticky top-0 z-20 glass-nav border-b border-hairline">
            <div className="container-aura h-[60px] md:h-[72px] flex items-center justify-between">
              <button
                onClick={() => openArticle(null)}
                className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
              >
                <ArrowLeft size={14} strokeWidth={1.5} />
                Back to Journal
              </button>
              <button
                onClick={() => openArticle(null)}
                aria-label="Close article"
                className="w-10 h-10 flex items-center justify-center c-ink hover:c-gold-deep transition-colors"
              >
                <X size={20} strokeWidth={1.25} />
              </button>
            </div>
          </div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[16/9] md:aspect-[2.4/1] w-full overflow-hidden bg-cream-deep"
          >
            <img
              src={article.heroImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
          </motion.div>

          {/* Article body */}
          <article className="container-aura max-w-3xl py-12 md:py-16">
            {/* Header block */}
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="-mt-24 md:-mt-32 relative z-10 mb-12 md:mb-16"
            >
              <div className="bg-canvas p-6 md:p-10 rounded-sm shadow-premium">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="t-label-caps c-gold-deep">{article.category}</span>
                  <span className="w-6 h-px bg-gold" aria-hidden />
                  <span className="t-caption c-ink-faint flex items-center gap-1.5">
                    <Calendar size={11} strokeWidth={1.5} />
                    {article.publishedAt}
                  </span>
                  <span className="t-caption c-ink-faint flex items-center gap-1.5">
                    <Clock size={11} strokeWidth={1.5} />
                    {article.readTime} read
                  </span>
                </div>
                <h1 className="t-display-md c-ink leading-tight mb-6">
                  {article.title}
                </h1>
                <p className="t-body-lg c-ink-muted leading-relaxed mb-6">
                  {article.excerpt}
                </p>

                {/* Author byline */}
                <div className="flex items-center gap-4 pt-6 border-t border-hairline">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-cream-deep flex-shrink-0">
                    <img
                      src={''}
                      alt={article.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="t-headline-sm c-ink">{article.author}</p>
                    <p className="t-caption c-ink-faint">{''}</p>
                  </div>
                </div>
              </div>
            </motion.header>

            {/* Body blocks — handles both structured blocks (array) and plain text (string) */}
            <div className="space-y-7 md:space-y-8">
              {(() => {
                // Normalize body to array of blocks (body is Json in DB — can be string or array)
                const rawBody = article.body as unknown;
                let blocks: JournalBodyBlock[] = [];
                if (typeof rawBody === "string") {
                  const paragraphs = rawBody.split(/\n\n+/).filter((p) => p.trim().length > 0);
                  blocks = paragraphs.map((text) => ({ type: "paragraph", text }));
                } else if (Array.isArray(rawBody)) {
                  blocks = rawBody as JournalBodyBlock[];
                } else if (rawBody && typeof rawBody === "object") {
                  blocks = [rawBody as JournalBodyBlock];
                }
                return blocks.map((block, i) => (
                  <BodyBlock key={i} block={block} delay={0.3 + i * 0.04} />
                ));
              })()}
            </div>

            {/* Ornamental divider */}
            <div className="divider-ornament my-16 md:my-20">
              <span className="t-label-caps c-gold-deep">End of Essay</span>
            </div>

            {/* Closing CTA — related products */}
            <ClosingCTA
              relatedProductSlugs={[]}
              onViewProduct={openProduct}
            />
          </article>

          {/* Footer close strip */}
          <div className="border-t border-hairline bg-cream/60 py-10">
            <div className="container-aura max-w-3xl text-center">
              <p className="t-body c-ink-muted mb-4">Read with us, monthly.</p>
              <button
                onClick={() => openArticle(null)}
                className="inline-flex items-center gap-3 bg-ink c-paper t-label-caps px-6 py-3.5 hover:bg-gold-deep transition-colors rounded-sm"
              >
                Back to all essays
                <ArrowRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Body block renderer                                                        */
/* -------------------------------------------------------------------------- */

function BodyBlock({
  block,
  delay,
}: {
  block: JournalBodyBlock;
  delay: number;
}) {
  const baseVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  if (block.type === "heading") {
    return (
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={baseVariants}
        transition={{ delay }}
        className="t-headline-lg c-ink pt-4"
      >
        {block.text}
      </motion.h2>
    );
  }

  if (block.type === "paragraph") {
    return (
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={baseVariants}
        transition={{ delay }}
        className="t-body-lg c-ink-muted leading-[1.75]"
      >
        {block.text}
      </motion.p>
    );
  }

  if (block.type === "quote") {
    return (
      <motion.blockquote
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={baseVariants}
        transition={{ delay }}
        className="my-12 md:my-16 pl-6 md:pl-8 border-l-2 border-gold"
      >
        <p className="t-display-md c-ink font-display italic leading-[1.25] mb-4">
          &ldquo;{block.text}&rdquo;
        </p>
        {block.attribution && (
          <footer className="t-label-caps c-gold-deep">
            — {block.attribution}
          </footer>
        )}
      </motion.blockquote>
    );
  }

  if (block.type === "image") {
    return (
      <motion.figure
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={baseVariants}
        transition={{ delay }}
        className="my-12 md:my-16"
      >
        <div className="aspect-[16/9] overflow-hidden bg-cream-deep rounded-sm">
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        {block.caption && (
          <figcaption className="t-caption c-ink-faint mt-3 text-center italic">
            {block.caption}
          </figcaption>
        )}
      </motion.figure>
    );
  }

  // list
  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={baseVariants}
      transition={{ delay }}
      className="space-y-3 my-4"
    >
      {(block.items ?? []).map((item, i) => (
        <li key={i} className="flex items-start gap-4">
          <span
            className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-gold-deep"
            aria-hidden
          />
          <span className="t-body-lg c-ink-muted leading-[1.7]">{item}</span>
        </li>
      ))}
    </motion.ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Closing CTA                                                                */
/* -------------------------------------------------------------------------- */

function ClosingCTA({
  relatedProductSlugs,
  onViewProduct,
}: {
  relatedProductSlugs: string[];
  onViewProduct: (slug: string) => void;
}) {
  const setView = useUIStore((s) => s.setView);
  const { products: related } = useProductsBySlugs(relatedProductSlugs);

  if (related.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6 md:p-10"
    >
      <p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
        <span className="w-6 h-px bg-gold" aria-hidden />
        Continue Reading
      </p>
      <h2 className="t-headline-md c-ink leading-tight mb-3">
        Pieces mentioned in this essay
      </h2>
      <p className="t-body c-ink-muted leading-relaxed mb-8 max-w-xl">
        Each one made by hand, sourced slowly, and shipped from our Lahore
        studio. Tap any card to see the full piece.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="bg-canvas border border-hairline-cream rounded-sm p-3 hover:border-gold/40 transition-colors cursor-pointer"
            onClick={() => onViewProduct(product.slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onViewProduct(product.slug);
              }
            }}
          >
            <div className="aspect-square overflow-hidden bg-cream-deep rounded-sm mb-3">
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <p className="t-caption c-ink-faint mb-1 line-clamp-1">
              {product.subtitle}
            </p>
            <h4 className="t-headline-sm c-ink line-clamp-1 mb-1">{product.name}</h4>
            <p className="t-body-sm c-ink-muted t-num">
              {formatPrice(product.price)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-hairline-cream">
        <button
          onClick={() => setView("shop")}
          className="inline-flex items-center gap-3 bg-ink c-paper t-label-caps px-6 py-3.5 hover:bg-gold-deep transition-colors rounded-sm"
        >
          Browse the full shop
          <ArrowRight size={14} strokeWidth={1.5} />
        </button>
      </div>
    </motion.section>
  );
}

export default JournalReader;
