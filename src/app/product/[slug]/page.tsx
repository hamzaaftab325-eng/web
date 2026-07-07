import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { ProductDetailPage } from "@/components/aura/commerce/ProductDetailPage";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import type { BadgeKind } from "@/types";
import { parseBadgeKind } from "@/types";
import type { CategorySlug } from "@/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { productMetadata } from "@/lib/seo-metadata";

// Phase 4B: ISR instead of force-dynamic.
// Product pages are cached for 1 hour, then revalidated in the background.
// First request after expiry serves stale + triggers regeneration (stale-while-revalidate).
// Expected: ~80% reduction in product page TTFB on cache hit.
//
// NOTE: We deliberately do NOT use generateStaticParams() here.
// Pre-rendering all products at build time exhausts the Prisma connection pool
// (connection_limit=1 for serverless) — see Vercel build log P2024 error.
// Instead, pages render on first request (lazy static generation), then cache.
// This keeps build times fast and avoids the connection-pool issue.
export const revalidate = 3600; // 1 hour

// Fallback: pages not yet cached are rendered on first request, then cached.
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aura-living-1.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug }, include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } });
  if (!product) return {};
  return productMetadata(
    product.name,
    product.description,
    product.slug,
    product.images[0]?.url
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } }, category: true },
  });
  if (!product) notFound();

  // Bug #28 fix: view tracking is now handled client-side by ProductDetailPage
  // (via a useEffect that POSTs to /api/track/product-view). This prevents
  // SSR/crawler/cache renders from inflating view counts.

  const transformedProduct = {
    id: product.id, slug: product.slug, name: product.name, subtitle: product.subtitle ?? undefined, description: product.description,
    longDescription: product.longDescription ?? undefined, price: Number(product.price), compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    category: (product.category?.slug ?? "lamps-lighting") as CategorySlug, images: product.images.map((img) => img.url), badge: parseBadgeKind(product.badge), inStock: product.inStock && product.stockQuantity > 0, stockQuantity: product.stockQuantity,
    variants: product.variants.map((v) => ({ id: v.id, label: v.label, swatch: v.swatchColor ?? undefined })),
    materials: product.materials, dimensions: product.dimensions ?? undefined, careInstructions: product.careInstructions ?? undefined, featured: product.featured,
  };

  // Phase 10C: Fetch review aggregate for aggregateRating in JSON-LD
  let rating: { average: number; count: number } | undefined;
  try {
    const reviewAgg = await db.review.aggregate({
      where: { productId: product.id, status: "approved" },
      _avg: { rating: true },
      _count: { rating: true },
    });
    if (reviewAgg._count.rating > 0) {
      rating = {
        average: Math.round((reviewAgg._avg.rating ?? 0) * 10) / 10,
        count: reviewAgg._count.rating,
      };
    }
  } catch {
    // DB error — skip rating
  }

  return (
    <>
      <ProductDetailPage product={transformedProduct} />
      <ProductJsonLd product={transformedProduct} rating={rating} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: `${BASE_URL}/` }, { name: "Shop", url: `${BASE_URL}/shop` }, { name: product.name, url: `${BASE_URL}/product/${product.slug}` }]} />
    </>
  );
}
