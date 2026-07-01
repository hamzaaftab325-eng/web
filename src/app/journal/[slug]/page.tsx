import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { JournalArticleView } from "@/components/aura/sections/JournalArticleView";
import type { JournalBodyBlock } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.journalArticle.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, heroImage: true, publishedAt: true },
  });

  if (!article) {
    return { title: "Article Not Found — Aura Living" };
  }

  const title = `${article.title} — Aura Living Journal`;
  const description = article.excerpt || "Notes on rooms, materials, and slow making from the Aura Living atelier.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: article.heroImage ? [{ url: article.heroImage }] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.heroImage ? [article.heroImage] : undefined,
    },
  };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const raw = await db.journalArticle.findUnique({
    where: { slug },
  });

  if (!raw) {
    notFound();
  }

  // Transform DB record to match JournalArticle type
  const article = {
    id: raw.id,
    title: raw.title,
    category: raw.category,
    slug: raw.slug,
    excerpt: raw.excerpt,
    heroImage: raw.heroImage,
    body: (Array.isArray(raw.body) ? raw.body : []) as unknown as JournalBodyBlock[],
    author: raw.author,
    readTime: raw.readTime ?? 0,
    publishedAt: raw.publishedAt?.toISOString() ?? "",
  };

  return <JournalArticleView article={article} />;
}
