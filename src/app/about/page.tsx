import type { Metadata } from "next";
import { pageMetadata, BASE_URL } from "@/lib/seo-metadata";
import { AboutView } from "@/components/aura/sections/AboutView";
import { JsonLd, aboutPageJsonLd, breadcrumbJsonLd as makeBreadcrumb } from "@/components/seo/JsonLd";

export const metadata: Metadata = pageMetadata("about", "/about");

const aboutBreadcrumb = makeBreadcrumb([
  { name: "Home", url: BASE_URL },
  { name: "About", url: "/about" },
]);

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutBreadcrumb} />
      <JsonLd data={aboutPageJsonLd()} />
      <AboutView />
    </>
  );
}
