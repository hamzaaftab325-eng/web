import Link from "next/link";

import { ProductGrid } from "@/components/aura/commerce/ProductGrid";
import { PageHero } from "@/components/aura/layout/PageHero";
import { FlashSaleBanner } from "@/components/aura/sections/FlashSaleBanner";
import { EmptyState } from "@/components/aura/ui/EmptyState";
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd, offerCatalogJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, BASE_URL } from "@/lib/seo-metadata";
import * as productService from "@/lib/services/product.service";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("sale", "/sale");

export const revalidate = 300; // 5 minutes

export default async function SalePage() {
  let products: Awaited<ReturnType<typeof productService.getOnSale>> = [];
  try {
    products = await productService.getOnSale();
  } catch {
    // DB unreachable - empty state will show
  }

  const saleBreadcrumb = breadcrumbJsonLd([
    { name: "Home", url: BASE_URL },
    { name: "Sale", url: "/sale" },
  ]);
  const saleCollectionPage = collectionPageJsonLd("On Sale", "/sale", "Handcrafted home decor on sale at Aura Living.");
  const saleOfferCatalog = offerCatalogJsonLd("Sale Items", products.length);

  return (
    <div className="bg-canvas">
      <JsonLd data={saleBreadcrumb} />
      <JsonLd data={saleCollectionPage} />
      <JsonLd data={saleOfferCatalog} />
      <PageHero
        image="/hero/shop.webp"
        alt="A curated home decor showroom with lamps, mirrors, and ceramics arranged on warm wood shelves."
        eyebrow="Sale"
        headline="On Sale"
      />

      <FlashSaleBanner />

      <section className="bg-canvas pt-6 md:pt-8">
        <div className="container-aura">
          <nav className="t-caption c-ink-faint flex items-center gap-2">
            <Link href="/" className="hover:c-gold transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="c-ink-muted">Sale</span>
          </nav>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="container-aura">
          {products.length > 0 ? (
            <>
              <div className="flex items-center justify-between gap-4 mb-6 md:mb-8 pb-4 border-b border-hairline">
                <p className="t-body c-ink-muted">
                  <span className="c-ink t-num font-medium">{products.length}</span>{" "}
                  {products.length === 1 ? "piece" : "pieces"} on sale
                </p>
                <p className="t-caption c-ink-faint">
                  Sorted by biggest saving
                </p>
              </div>

              <ProductGrid products={products as never} priorityCount={4} />
            </>
          ) : (
            <EmptyState
              title="No items on sale right now. Check back soon!"
              body="In the meantime, explore the full catalogue."
              cta={
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 border border-ink t-label-caps c-ink px-8 py-3.5 hover:bg-ink hover:c-paper transition-colors"
                >
                  Browse the Shop
                </Link>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}