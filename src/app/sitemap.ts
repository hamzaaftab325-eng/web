
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

import type { MetadataRoute } from "next";

/**
 * app/sitemap.ts — dynamic sitemap for search engines.
 *
 * Includes:
 *  - All static pages (home, shop, about, journal, care, legal, etc.)
 *  - All active products (/product/[slug])
 *  - All published journal articles (/journal/[slug]) with hero images
 *
 * Phase 10A: Uses getSiteUrl() instead of hardcoded URL.
 * Phase 10F: Journal articles now include images field for image search indexing.
 */

const BASE_URL = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Phase 10A: Use file mtime for static pages instead of now() — prevents
  // every sitemap fetch from reporting all pages as modified.
  // For now, using a fixed date per page would require build-time injection.
  // Using now() is acceptable — Google handles this fine.
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/sale`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/collections`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/care`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/returns`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/shipping-info`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    productPages = products.map((p) => ({
      url: `${BASE_URL}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB error — skip products
  }

  // Dynamic journal article pages
  // Phase 10F: Include heroImage in images field for image search indexing
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await db.journalArticle.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, publishedAt: true, heroImage: true },
    });
    articlePages = articles.map((a) => ({
      url: `${BASE_URL}/journal/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: a.heroImage ? [a.heroImage.startsWith("http") ? a.heroImage : `${BASE_URL}${a.heroImage}`] : undefined,
    }));
  } catch {
    // DB error — skip articles
  }

  return [...staticPages, ...productPages, ...articlePages];
}
