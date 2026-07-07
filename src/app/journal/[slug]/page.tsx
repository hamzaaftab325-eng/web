import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { JournalArticleView } from "@/components/aura/sections/JournalArticleView";
import type { JournalBodyBlock } from "@/types";
import { parseJournalBody } from "@/lib/validators/journal";
import { articleMetadata, BASE_URL } from "@/lib/seo-metadata";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.journalArticle.findUnique({
    where: { slug, isActive: true },
    select: { title: true, excerpt: true, heroImage: true, publishedAt: true },
  });

  if (!article) {
    return { title: "Aura Living - Article Not Found" };
  }

  return articleMetadata(
    article.title,
    article.excerpt,
    slug,
    article.heroImage
  );
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const raw = await db.journalArticle.findUnique({
    where: { slug, isActive: true },
  });

  if (!raw) {
    notFound();
  }

  const article = {
    id: raw.id,
    title: raw.title,
    category: raw.category,
    slug: raw.slug,
    excerpt: raw.excerpt,
    heroImage: raw.heroImage,
    body: parseJournalBody(raw.body) as JournalBodyBlock[],
    author: raw.author,
    readTime: raw.readTime ?? 0,
    publishedAt: raw.publishedAt?.toISOString() ?? "",
  };

  // BlogPosting structured data for Google Article rich results
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: raw.title,
    description: raw.excerpt,
    image: raw.heroImage ? [raw.heroImage] : undefined,
    author: {
      "@type": "Person",
      name: raw.author || "Aura Living",
    },
    publisher: {
      "@type": "Organization",
      name: "Aura Living",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo-black.svg`,
      },
    },
    datePublished: raw.publishedAt?.toISOString(),
    dateModified: raw.updatedAt.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/journal/${slug}`,
    },
  };

  // BreadcrumbList structured data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Journal", item: `${BASE_URL}/journal` },
      { "@type": "ListItem", position: 3, name: raw.title, item: `${BASE_URL}/journal/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <JournalArticleView article={article} />
    </>
  );
}
