import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

/**
 * app/sitemap.ts — dynamic sitemap for search engines.
 *
 * Includes:
 *  - All static pages (home, shop, about, journal, care, legal, etc.)
 *  - All active products (/product/[slug])
 *  - All published journal articles (/journal/[slug])
 *  - All care guides (/care — individual guides viewed via modal)
 *
 * Fetched from the database on every request.
 */

const BASE_URL = "https://aura-living-1.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/collections`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/care`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/returns`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/shipping-info`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/account`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
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
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await db.journalArticle.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    });
    articlePages = articles.map((a) => ({
      url: `${BASE_URL}/journal/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB error — skip articles
  }

  return [...staticPages, ...productPages, ...articlePages];
}
