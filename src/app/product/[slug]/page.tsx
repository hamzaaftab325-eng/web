import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { ProductDetailPage } from "@/components/aura/commerce/ProductDetailPage";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import type { BadgeKind } from "@/types";
import type { CategorySlug } from "@/types";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { productMetadata } from "@/lib/seo-metadata";

// Phase 4B: ISR instead of force-dynamic.
// Product pages are cached for 1 hour, then revalidated in the background.
// First request after expiry serves stale + triggers regeneration (stale-while-revalidate).
// Expected: ~80% reduction in product page TTFB on cache hit.
//
// generateStaticParams() below pre-renders all active products at build time
// so the most-visited pages are cached from the very first request.
export const revalidate = 3600; // 1 hour

// Fallback: pages not pre-rendered at build time are rendered on first request,
// then cached. This gives us "lazy static generation" — long-tail products
// don't slow down the build, but get cached after first view.
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aura-living-1.vercel.app";

/**
 * Pre-render all active products at build time.
 * Returns slugs for every active product so they're cached from day one.
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch (error) {
    // If DB is unreachable at build time, render all product pages on-demand
    console.warn("[product/generateStaticParams] Failed to fetch product slugs:", error);
    return [];
  }
}

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
    category: (product.category?.slug ?? "lamps-lighting") as CategorySlug, images: product.images.map((img) => img.url), badge: (product.badge ?? undefined) as BadgeKind | undefined, inStock: product.inStock && product.stockQuantity > 0, stockQuantity: product.stockQuantity,
    variants: product.variants.map((v) => ({ id: v.id, label: v.label, swatch: v.swatchColor ?? undefined })),
    materials: product.materials, dimensions: product.dimensions ?? undefined, careInstructions: product.careInstructions ?? undefined, featured: product.featured,
  };

  return (
    <>
      <ProductDetailPage product={transformedProduct} />
      <ProductJsonLd product={transformedProduct} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: `${BASE_URL}/` }, { name: "Shop", url: `${BASE_URL}/shop` }, { name: product.name, url: `${BASE_URL}/product/${product.slug}` }]} />
    </>
  );
}
