"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

import { PageHero } from "@/components/aura/layout/PageHero";
import { useScrollProgress } from "@/hooks/use-scroll-animations";
import type { JournalArticle as JournalArticleType, JournalBodyBlock } from "@/types";

interface Props {
  article: JournalArticleType;
}

export function JournalArticleView({ article }: Props) {
  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Reading progress bar — fills as user scrolls through the article
  const scaleX = useScrollProgress();

  return (
    <>
      {/* Reading progress bar — fixed at top, gold, grows with scroll */}
      <motion.div
        style={{ scaleX, transformOrigin: "0%" }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gold z-[200] will-change-transform"
        aria-hidden
      />

      <PageHero
        image={article.heroImage || "/hero/journal.webp"}
        alt={article.title}
        eyebrow="Journal"
        headline={article.category || "Atelier Notes"}
      />

      <article className="container-aura py-16 md:py-24 max-w-3xl">
        {/* Back link */}
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 t-label-caps c-ink-faint hover:c-gold-deep transition-colors mb-8"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to Journal
        </Link>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-3xl md:text-5xl c-ink leading-tight mb-4"
        >
          {article.title}
        </motion.h1>

        {/* Meta */}
        <div className="flex items-center gap-4 t-caption c-ink-faint mb-10">
          {publishedDate && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} strokeWidth={1.5} />
              {publishedDate}
            </span>
          )}
          {article.readTime && (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} strokeWidth={1.5} />
              {article.readTime} min read
            </span>
          )}
          {article.author && <span>· By {article.author}</span>}
        </div>

        {/* Hero image */}
        {article.heroImage && (
          <div className="relative aspect-[16/9] mb-10 overflow-hidden rounded-sm">
            <Image
              src={article.heroImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p className="t-body-lg c-ink-muted leading-relaxed mb-10 font-display italic">
            {article.excerpt}
          </p>
        )}

        {/* Body — handles both structured blocks (array) and plain text (string) */}
        <div className="space-y-6">
          {(() => {
            // The body field can be either:
            // 1. An array of structured blocks: [{ type: "paragraph", text: "..." }, ...]
            // 2. A plain string (saved from the admin textarea)
            // 3. A JSON string that needs parsing
            // Normalize all cases to an array of blocks.
            // Cast to unknown first — the type says JournalBodyBlock[] but at runtime
            // it can be a string (saved from the admin textarea).
            const rawBody = article.body as unknown;
            let blocks: JournalBodyBlock[] = [];

            if (typeof rawBody === "string") {
              // Plain text from admin textarea — split by double newlines into paragraphs
              const paragraphs = rawBody.split(/\n\n+/).filter((p) => p.trim().length > 0);
              blocks = paragraphs.map((text) => ({ type: "paragraph", text }));
            } else if (Array.isArray(rawBody)) {
              blocks = rawBody as JournalBodyBlock[];
            } else if (rawBody && typeof rawBody === "object") {
              // Single block object (edge case) — wrap in array
              blocks = [rawBody as JournalBodyBlock];
            }

            return blocks.map((block: JournalBodyBlock, i: number) => {
              if (block.type === "heading") {
                return (
                  <h2 key={i} className="font-display text-2xl c-ink mt-12 mb-4">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "paragraph") {
                return (
                  <p key={i} className="t-body c-ink-muted leading-relaxed">
                    {block.text}
                  </p>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote key={i} className="border-l-2 border-gold pl-6 my-8">
                    <p className="font-display text-xl c-ink italic">{block.text}</p>
                    {block.attribution && (
                      <cite className="t-caption c-ink-faint not-italic mt-2 block">
                        — {block.attribution}
                      </cite>
                    )}
                  </blockquote>
                );
              }
              if (block.type === "image" && (block.src || block.image)) {
                return (
                  <figure key={i} className="my-8">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                      <Image
                        src={block.src || block.image || ""}
                        alt={block.alt || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {block.caption && (
                      <figcaption className="t-caption c-ink-faint text-center mt-2">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              if (block.type === "list" && block.items) {
                return (
                  <ul key={i} className="space-y-2 my-6 pl-6">
                    {block.items.map((item: string, j: number) => (
                      <li key={j} className="t-body c-ink-muted leading-relaxed list-disc">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }
              return null;
            });
          })()}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-hairline text-center">
          <p className="t-label-caps c-ink-faint mb-4">Thank you for reading</p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            More from the Journal
          </Link>
        </div>
      </article>
    </>
  );
}

export default JournalArticleView;
