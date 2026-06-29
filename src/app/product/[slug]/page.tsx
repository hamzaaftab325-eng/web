import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetailPage } from "@/components/aura/commerce/ProductDetailPage";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

const BASE_URL = "https://aura-living-1.vercel.app";

export async function generateStaticParams() {
  const products = await db.product.findMany({ where: { isActive: true }, select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  if (!product) return {};
  return {
    title: `${product.name} — Aura Living`,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}`, languages: { "en-US": `${BASE_URL}/product/${product.slug}` } },
    openGraph: { title: `${product.name} — Aura Living`, description: product.description, url: `${BASE_URL}/product/${product.slug}`, siteName: "Aura Living", type: "website", images: product.images.map((img) => ({ url: img.url, width: 900, height: 1125, alt: product.name })) },
    twitter: { card: "summary_large_image", title: `${product.name} — Aura Living`, description: product.description, images: [product.images[0]?.url ?? ""] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } }, category: true },
  });
  if (!product) notFound();

  const transformedProduct = {
    id: product.id, slug: product.slug, name: product.name, subtitle: product.subtitle ?? undefined, description: product.description,
    longDescription: product.longDescription ?? undefined, price: Number(product.price), compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    category: (product.category?.slug ?? "lamps-lighting") as any, images: product.images.map((img) => img.url), badge: product.badge as any, inStock: product.inStock,
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
