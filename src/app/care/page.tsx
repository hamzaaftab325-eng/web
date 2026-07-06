import type { Metadata } from "next";
import { pageMetadata, BASE_URL } from "@/lib/seo-metadata";
import { CareView } from "@/components/aura/sections/CareView";
import * as contentService from "@/lib/services/content.service";
import { JsonLd, breadcrumbJsonLd as makeBreadcrumb } from "@/components/seo/JsonLd";

export const metadata: Metadata = pageMetadata("care", "/care");

export const revalidate = 3600;

const careBreadcrumb = makeBreadcrumb([
  { name: "Home", url: BASE_URL },
  { name: "Care Guides", url: "/care" },
]);

export default async function CarePage() {
  let guides;
  try {
    guides = await contentService.getCareGuides();
  } catch {
    // DB unreachable — CareView falls back to client-side fetching
  }

  return (
    <>
      <JsonLd data={careBreadcrumb} />
      <CareView initialGuides={guides} />
    </>
  );
}
