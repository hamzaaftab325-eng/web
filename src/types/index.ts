/**
 * Aura Living — Type definitions
 */

export type CategorySlug =
  | "lamps-lighting"
  | "mirrors"
  | "indoor-plants"
  | "planters-pots"
  | "decorative-accessories"
  | "wall-art";

export type CollectionSlug = "warm-tones" | "the-plant-edit" | "gift-guide-under-150";

export type BadgeKind = "New" | "Bestseller" | "Sale" | "Sold Out";

export interface ProductVariant {
  id: string;
  label: string;
  swatch?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  price: number;
  compareAtPrice?: number;
  category: CategorySlug;
  collections?: CollectionSlug[];
  images: string[];
  badge?: BadgeKind;
  inStock: boolean;
  variants?: ProductVariant[];
  materials?: string[];
  dimensions?: string;
  careInstructions?: string;
  featured?: boolean;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  heroImage: string;
  productCount?: number;
}

export interface Collection {
  slug: CollectionSlug;
  name: string;
  description: string;
  heroImage: string;
  productSlugs: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  rating: number;
  productSlug?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "Shipping" | "Returns" | "Product Care" | "Orders";
}

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  variantLabel?: string;
  quantity: number;
}

export type ViewKey = "home" | "shop" | "about" | "journal";

export interface ActiveFilter {
  field: "category" | "material" | "price";
  value: string;
  label: string;
}
