/**
 * Reusable JSON-LD structured data helpers.
 *
 * All helpers return objects that can be rendered via:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
 *
 * Centralized here so schema changes happen in one place.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aura-living-1.vercel.app";

/** BreadcrumbList schema — Home > Page > SubPage */
export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/** CollectionPage schema — for shop, collections, sale pages */
export function collectionPageJsonLd(name: string, url: string, description?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: url.startsWith("http") ? url : `${BASE_URL}${url}`,
    description: description ?? name,
    isPartOf: { "@type": "WebSite", name: "Aura Living", url: BASE_URL },
  };
}

/** AboutPage schema */
export function aboutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Aura Living",
    url: `${BASE_URL}/about`,
    description: "Founded in Lahore, Aura Living sources slowly from workshops we visit by name.",
    mainEntity: {
      "@type": "Organization",
      name: "Aura Living",
      url: BASE_URL,
      foundingDate: "2025",
      founder: { "@type": "Person", name: "Hamza Aftab" },
    },
  };
}

/** Article schema — for care guides */
export function articleJsonLd(title: string, description: string, slug: string, image?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? (image.startsWith("http") ? [image] : [`${BASE_URL}${image}`]) : undefined,
    author: { "@type": "Organization", name: "Aura Living" },
    publisher: {
      "@type": "Organization",
      name: "Aura Living",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo-black.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/care` },
  };
}

/** OfferCatalog schema — for sale page */
export function offerCatalogJsonLd(name: string, itemCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name,
    numberOfItems: itemCount,
  };
}

/** JSON-LD script tag renderer */
export function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
