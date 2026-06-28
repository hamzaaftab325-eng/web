import type { Product } from "@/types";

/**
 * ProductJsonLd — renders Product schema.org structured data as
 * a server-side <script type="application/ld+json"> tag.
 *
 * Enables Google Rich Results (price, availability, ratings) in
 * search results. Validate at https://search.google.com/test/rich-results
 */

interface ProductJsonLdProps {
  product: Product;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Aura Living",
    },
    image: product.images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://aura-living-1.vercel.app/shop`,
      seller: {
        "@type": "Organization",
        name: "Aura Living",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default ProductJsonLd;
