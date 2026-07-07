import type { Product } from "@/types";
import { getSiteUrl } from "@/lib/site-url";

/**
 * ProductJsonLd — renders Product schema.org structured data as
 * a server-side <script type="application/ld+json"> tag.
 *
 * Enables Google Rich Results (price, availability, ratings) in
 * search results. Validate at https://search.google.com/test/rich-results
 *
 * Phase 10A: Uses getSiteUrl() instead of hardcoded BASE_URL.
 * Phase 10C: Supports aggregateRating when reviews exist.
 */

const BASE_URL = getSiteUrl();

interface ProductJsonLdProps {
  product: Product;
  /** Optional aggregate rating data — pass from the product page when reviews exist. */
  rating?: {
    average: number;
    count: number;
  };
}

export function ProductJsonLd({ product, rating }: ProductJsonLdProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Aura Living",
    },
    image: product.images?.map((img) =>
      img.startsWith("http") ? img : `${BASE_URL}${img}`
    ),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "PKR",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/product/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "Aura Living",
      },
    },
  };

  // Phase 10C: Add aggregateRating when reviews exist.
  // This enables star ratings in Google rich results → measurable CTR lift.
  if (rating && rating.count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.average,
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default ProductJsonLd;
