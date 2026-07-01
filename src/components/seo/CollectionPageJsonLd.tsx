/**
 * CollectionPageJsonLd — renders CollectionPage schema.org structured data.
 *
 * Used on collection index pages to help search engines understand
 * that the page is a curated collection of products.
 */

interface CollectionPageJsonLdProps {
  name: string;
  description: string;
  url: string;
  productNames: string[];
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  productNames,
}: CollectionPageJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    hasPart: productNames.map((productName) => ({
      "@type": "Product",
      name: productName,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default CollectionPageJsonLd;
