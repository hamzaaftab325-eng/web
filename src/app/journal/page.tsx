import type { Metadata } from "next";
import { pageMetadata, BASE_URL } from "@/lib/seo-metadata";
import { JournalView } from "@/components/aura/sections/JournalView";
import * as contentService from "@/lib/services/content.service";

export const metadata: Metadata = pageMetadata("journal", "/journal");

export const revalidate = 3600; // 1 hour — articles change rarely

// BreadcrumbList + Blog structured data
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "Journal", item: `${BASE_URL}/journal` },
  ],
};

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Aura Living Journal",
  url: `${BASE_URL}/journal`,
  publisher: {
    "@type": "Organization",
    name: "Aura Living",
    logo: { "@type": "ImageObject", url: `${BASE_URL}/logo-black.svg` },
  },
};

export default async function JournalPage() {
  let articles;
  try {
    articles = await contentService.getArticles();
  } catch {
    // DB unreachable — JournalView falls back to client-side fetching
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <JournalView initialArticles={articles} />
    </>
  );
}
