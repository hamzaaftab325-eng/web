import type { Metadata } from "next";
import { pageMetadata, BASE_URL } from "@/lib/seo-metadata";
import { CollectionsView } from "@/components/aura/sections/CollectionsView";
import * as collectionService from "@/lib/services/collection.service";
import { JsonLd, breadcrumbJsonLd as makeBreadcrumb, collectionPageJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = pageMetadata("collections", "/collections");

export const revalidate = 600;

const collectionsBreadcrumb = makeBreadcrumb([
  { name: "Home", url: BASE_URL },
  { name: "Collections", url: "/collections" },
]);
const collectionsPage = collectionPageJsonLd("Collections", "/collections", "Curated selections of lamps, mirrors, and ceramics.");

export default async function CollectionsPage() {
  let collections;
  try {
    collections = await collectionService.getAll();
  } catch {
    // DB unreachable — CollectionsView falls back to client-side fetching
  }

  return (
    <>
      <JsonLd data={collectionsBreadcrumb} />
      <JsonLd data={collectionsPage} />
      <CollectionsView initialCollections={collections} />
    </>
  );
}
