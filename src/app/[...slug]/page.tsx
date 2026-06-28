import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/aura/layout/SiteShell";
import { urlToView } from "@/lib/view-url";
import { pageMetadata } from "@/lib/seo-metadata";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { faqs } from "@/data/faq";
import type { ViewKey } from "@/types";

const BASE_URL = "https://aura-living-1.vercel.app";

/**
 * Catch-all route — renders SiteShell for valid URLs, triggers 404 for unknown.
 *
 * Uses generateMetadata to produce per-page SEO metadata (title, description,
 * OpenGraph, Twitter card, canonical URL) based on the URL path.
 *
 * Also renders server-side JSON-LD structured data (FAQ, Breadcrumbs) for
 * Google Rich Results.
 */

interface CatchAllPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pathname = "/" + slug.join("/");
  const view = urlToView(pathname);
  if (!view) return {};
  return pageMetadata(view as ViewKey, pathname);
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const pathname = "/" + slug.join("/");
  const view = urlToView(pathname);

  if (!view) {
    notFound();
  }

  const viewKey = view as ViewKey;

  return (
    <>
      <SiteShell initialView={viewKey} />

      {/* Server-side JSON-LD structured data for SEO */}
      {viewKey === "home" && (
        <FaqJsonLd
          items={faqs.map((f) => ({ question: f.question, answer: f.answer }))}
        />
      )}

      {/* Breadcrumbs for key pages */}
      {(viewKey === "shop" || viewKey === "about" || viewKey === "journal" || viewKey === "collections" || viewKey === "artisans" || viewKey === "sustainability" || viewKey === "care") && (
        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: BASE_URL + "/" },
            { name: viewKey.charAt(0).toUpperCase() + viewKey.slice(1), url: BASE_URL + pathname },
          ]}
        />
      )}

      {/* Account breadcrumbs */}
      {viewKey.startsWith("account") && (
        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: BASE_URL + "/" },
            { name: "Account", url: BASE_URL + "/account" },
            ...(viewKey !== "account" ? [{ name: viewKey.replace("account-", "").replace("-", " "), url: BASE_URL + pathname }] : []),
          ]}
        />
      )}
    </>
  );
}
