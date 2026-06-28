import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, productBySlug } from "@/data/products";
import { ProductDetailPage } from "@/components/aura/commerce/ProductDetailPage";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const BASE_URL = "https://aura-living-1.vercel.app";

/**
 * Generate static paths for all products at build time (SSG).
 * Enables fast static page loads + SEO crawlability.
 */
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

/**
 * Generate per-product metadata (title, description, OG image).
 * In Next.js 16, params is a Promise and must be awaited.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} — Aura Living`,
    description: product.description,
    alternates: {
      canonical: `/product/${product.slug}`,
      languages: { "en-US": `${BASE_URL}/product/${product.slug}` },
    },
    openGraph: {
      title: `${product.name} — Aura Living`,
      description: product.description,
      url: `${BASE_URL}/product/${product.slug}`,
      siteName: "Aura Living",
      type: "website",
      images: product.images.map((img) => ({
        url: img,
        width: 900,
        height: 1125,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — Aura Living`,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <ProductDetailPage product={product} />
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BASE_URL}/` },
          { name: "Shop", url: `${BASE_URL}/shop` },
          { name: product.name, url: `${BASE_URL}/product/${product.slug}` },
        ]}
      />
    </>
  );
}
