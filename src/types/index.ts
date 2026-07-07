/**
 * Phase 6D: CategorySlug and CollectionSlug are now `string` aliases
 * instead of hardcoded literal unions. Categories and collections are
 * admin-editable via /admin/content/categories — a hardcoded literal union
 * meant TypeScript wouldn't know about new categories added in production,
 * causing type errors when the DB returned unknown slugs.
 *
 * The known defaults are preserved as constants below for documentation
 * and use in seed scripts / tests, but the type itself is `string` so
 * any admin-created category slug is accepted.
 */
export type CategorySlug = string;
export type CollectionSlug = string;

/** Known default category slugs (for reference — not enforced at the type level). */
export const DEFAULT_CATEGORY_SLUGS = [
  "lamps-lighting",
  "mirrors",
  "indoor-plants",
  "planters-pots",
  "decorative-accessories",
  "wall-art",
] as const;

/** Known default collection slugs (for reference — not enforced at the type level). */
export const DEFAULT_COLLECTION_SLUGS = [
  "warm-tones",
  "the-plant-edit",
  "gift-guide-under-150",
] as const;

export type BadgeKind = "New" | "Bestseller" | "Sale" | "Sold Out" | "Limited" | "Back in Stock" | "Featured" | "Exclusive";

/** Known valid badge values — used by parseBadgeKind() for runtime validation. */
export const BADGE_KINDS: readonly BadgeKind[] = [
  "New", "Bestseller", "Sale", "Sold Out", "Limited", "Back in Stock", "Featured", "Exclusive",
] as const;

/**
 * Phase 6G: Runtime validator for BadgeKind.
 * Returns the value if it's a valid BadgeKind, undefined otherwise.
 * Replaces `as BadgeKind` casts that could let invalid DB values through.
 */
export function parseBadgeKind(value: string | null | undefined): BadgeKind | undefined {
  if (value == null) return undefined;
  return (BADGE_KINDS as readonly string[]).includes(value) ? (value as BadgeKind) : undefined;
}

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
  stockQuantity?: number;
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
  stockQuantity?: number;
}

export type ViewKey =
  | "home" | "shop" | "about" | "journal"
  | "login" | "signup" | "forgot-password" | "reset-password"
  | "account" | "account-orders" | "account-order-detail"
  | "account-addresses" | "account-wishlist" | "account-preferences"
  | "account-privacy"
  | "collections" | "care" | "sale"
  | "product-detail";

export interface ActiveFilter {
  field: "category" | "material" | "price";
  value: string;
  label: string;
}

// Content types
export interface CareGuide { id: string; slug: string; title: string; material: string; excerpt: string; body: { type: "paragraph" | "heading" | "list"; text?: string; items?: string[] }[]; }
export interface JournalBodyBlock { type: "paragraph" | "heading" | "quote" | "image" | "list"; text?: string; items?: string[]; image?: string; src?: string; alt?: string; caption?: string; attribution?: string; }
export interface JournalArticle { id: string; slug: string; title: string; category: string; excerpt: string; heroImage: string; body: JournalBodyBlock[]; author: string; readTime: number; publishedAt: string; }
export interface HeroSlide { id: string; image: string; eyebrow: string; headline: string; subtitle: string; ctaLabel: string; ctaAction: string; alt: string; }
// PressItem removed — feature discontinued
export interface BrandValue { icon: string; title: string; description: string; }
