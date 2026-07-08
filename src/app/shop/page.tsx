import { ShopView } from "@/components/aura/sections/ShopView";
import { JsonLd, breadcrumbJsonLd as makeBreadcrumb, collectionPageJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, BASE_URL } from "@/lib/seo-metadata";
import * as categoryService from "@/lib/services/category.service";
import * as collectionService from "@/lib/services/collection.service";
import * as productService from "@/lib/services/product.service";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("shop", "/shop");

export const revalidate = 300;

const shopBreadcrumb = makeBreadcrumb([
  { name: "Home", url: BASE_URL },
  { name: "Shop", url: "/shop" },
]);
const shopCollectionPage = collectionPageJsonLd("Shop", "/shop", "Browse handcrafted lamps, mirrors, ceramics, planters, and décor.");

export default async function ShopPage() {
  let products: Awaited<ReturnType<typeof productService.getAll>> | null = null;
  let categories: Awaited<ReturnType<typeof categoryService.getAll>> = [];
  let collections: Awaited<ReturnType<typeof collectionService.getAll>> = [];

  try {
    [products, categories, collections] = await Promise.all([
      productService.getAll({ limit: 100 }),
      categoryService.getAll(),
      collectionService.getAll(),
    ]);
  } catch {
    // DB unreachable — ShopView will fall back to client-side fetching
  }

  return (
    <>
      <JsonLd data={shopBreadcrumb} />
      <JsonLd data={shopCollectionPage} />
      <ShopView
        initialProducts={products?.products}
        initialCategories={categories.length > 0 ? categories : undefined}
        initialCollections={collections.length > 0 ? collections : undefined}
      />
    </>
  );
}
