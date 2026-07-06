/**
 * Organization + WebSite structured data (JSON-LD).
 *
 * Rendered once in the root layout (app/layout.tsx) so every page
 * includes it. Enables:
 * - Google Knowledge Panel (Organization)
 * - Sitelinks Search Box (WebSite + SearchAction)
 * - Rich brand results
 *
 * Validate at: https://search.google.com/test/rich-results
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aura-living-1.vercel.app";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Aura Living",
    url: BASE_URL,
    logo: `${BASE_URL}/logo-black.svg`,
    description:
      "Premium home décor atelier. Handcrafted lamps, mirrors, planters, and sculptural objects.",
    foundingDate: "2025",
    founders: [{ "@type": "Person", name: "Hamza Aftab" }],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "concierge@auraliving.com",
      availableLanguage: ["English", "Urdu"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressCountry: "PK",
    },
    sameAs: [
      "https://www.instagram.com/auraliving",
      "https://www.facebook.com/auraliving",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Aura Living",
    url: BASE_URL,
    description:
      "Premium home décor atelier. Handcrafted lamps, mirrors, planters, and sculptural objects.",
    publisher: {
      "@type": "Organization",
      name: "Aura Living",
      logo: `${BASE_URL}/logo-black.svg`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
