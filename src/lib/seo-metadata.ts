import { getSiteUrl } from "@/lib/site-url";
import type { ViewKey } from "@/types";

import type { Metadata } from "next";


/**
 * SEO metadata library — single source of truth for per-page metadata.
 *
 * Title format: "Aura Living - {Descriptive Keyword Title}" (brand FIRST, hyphen)
 * Descriptions: 150-155 characters, unique, keyword-rich, compelling CTA.
 *
 * All canonical URLs are ABSOLUTE (required by Google).
 * BASE_URL comes from getSiteUrl() which throws in production if env var is missing.
 */

const BASE_URL = getSiteUrl();

interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
}

const PAGE_META: Record<ViewKey, PageMeta> = {
  home: {
    title: "Aura Living - Considered Objects for the Considered Home",
    description:
      "Premium home décor atelier. Handcrafted lamps, mirrors, planters, and sculptural objects. Warm minimalism, artisanal craft, made to be lived with.",
    ogImage: "/hero/slide-1.webp",
  },
  shop: {
    title: "Aura Living - Premium Home Décor, Lamps & Decorative Accessories",
    description:
      "Browse handcrafted lamps, mirrors, ceramics, planters, and décor. Each piece sourced from small workshops. Cash on delivery across Pakistan.",
    ogImage: "/hero/shop.webp",
  },
  about: {
    title: "Aura Living - Our Story & Design Philosophy",
    description:
      "Founded in Lahore, Aura Living sources slowly from workshops we visit by name. Meet the makers behind every lamp, mirror, and planter.",
    ogImage: "/hero/about.webp",
  },
  journal: {
    title: "Aura Living - Interior Design Journal & Styling Inspiration",
    description:
      "Essays on slow living, material care, and interior design. Notes on rooms, craft, and considered objects from the Aura Living atelier.",
    ogImage: "/hero/journal.webp",
  },
  collections: {
    title: "Aura Living - Curated Home Décor Collections",
    description:
      "Curated selections of lamps, mirrors, and ceramics. Each collection is a complete point of view — gathered by palette, purpose, or season.",
    ogImage: "/hero/collections.webp",
  },
  care: {
    title: "Aura Living - Product Care & Maintenance Guide",
    description:
      "Material-specific care guides for ceramic, brass, wood, linen, plants, and glass. Keep your pieces beautiful for years to come.",
    ogImage: "/hero/care.webp",
  },
  sale: {
    title: "Aura Living - Exclusive Seasonal Home Décor Offers",
    description:
      "Discover handcrafted lamps, mirrors, ceramics, and décor on sale at Aura Living. Limited-time prices on considered objects, made to be lived with.",
    ogImage: "/hero/shop.webp",
  },
  login: {
    title: "Aura Living - Sign In",
    description: "Sign in to track orders, save favorites, and check out faster.",
  },
  signup: {
    title: "Aura Living - Create Account",
    description: "Join Aura Living for faster checkout, order tracking, and personalized picks.",
  },
  "forgot-password": {
    title: "Aura Living - Forgot Password",
    description: "Reset your Aura Living account password securely.",
  },
  "reset-password": {
    title: "Aura Living - Reset Password",
    description: "Set a new password for your Aura Living account.",
  },
  account: {
    title: "Aura Living - My Account",
    description: "View orders, manage addresses, track shipments, and update preferences.",
  },
  "account-orders": {
    title: "Aura Living - Order History",
    description: "View your past orders and track current shipments.",
  },
  "account-order-detail": {
    title: "Aura Living - Order Details",
    description: "Track your order status, view items, and download receipts.",
  },
  "account-addresses": {
    title: "Aura Living - Saved Addresses",
    description: "Manage your shipping and billing addresses for faster checkout.",
  },
  "account-wishlist": {
    title: "Aura Living - Wishlist",
    description: "Your saved pieces, ready to move to cart when the time is right.",
  },
  "account-preferences": {
    title: "Aura Living - Preferences",
    description: "Manage email subscriptions, style preferences, and display settings.",
  },
  "account-privacy": {
    title: "Aura Living - Data & Privacy",
    description: "Download your data or permanently delete your account. Your privacy, your control.",
  },
  "product-detail": {
    title: "Aura Living - Product",
    description: "Handcrafted home décor from Aura Living. Made by hand, made to last.",
  },
};

/**
 * Generate full Metadata for a view at a given pathname.
 * Canonical URLs are ABSOLUTE (required by Google).
 */
export function pageMetadata(view: ViewKey, pathname: string): Metadata {
  const meta = PAGE_META[view] ?? PAGE_META.home;
  const canonical = BASE_URL + pathname;
  const ogImage = meta.ogImage
    ? meta.ogImage.startsWith("http")
      ? meta.ogImage
      : BASE_URL + meta.ogImage
    : BASE_URL + "/hero/slide-1.webp";

  const isPrivate =
    view.startsWith("account") ||
    view === "login" ||
    view === "signup" ||
    view === "forgot-password" ||
    view === "reset-password";

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      siteName: "Aura Living",
      type: "website",
      locale: "en_US",
      images: [{ url: ogImage, width: 1344, height: 768, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [ogImage],
    },
    robots: isPrivate
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Metadata for the home page (app/page.tsx).
 */
export function homeMetadata(): Metadata {
  return pageMetadata("home", "/");
}

/**
 * Generate dynamic metadata for a product page.
 * Uses product name + first image for OG/Twitter.
 */
export function productMetadata(name: string, description: string, slug: string, image?: string): Metadata {
  const canonical = `${BASE_URL}/product/${slug}`;
  const ogImage = image
    ? (image.startsWith("http") ? image : `${BASE_URL}${image}`)
    : `${BASE_URL}/hero/shop.webp`;

  return {
    title: `Aura Living - ${name}`,
    description: description.slice(0, 155),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: `Aura Living - ${name}`,
      description: description.slice(0, 155),
      url: canonical,
      siteName: "Aura Living",
      type: "website",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Aura Living - ${name}`,
      description: description.slice(0, 155),
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

/**
 * Generate dynamic metadata for a journal article.
 */
export function articleMetadata(title: string, excerpt: string, slug: string, image?: string): Metadata {
  const canonical = `${BASE_URL}/journal/${slug}`;
  const ogImage = image
    ? (image.startsWith("http") ? image : `${BASE_URL}${image}`)
    : `${BASE_URL}/hero/journal.webp`;

  return {
    title: `Aura Living - ${title}`,
    description: (excerpt || "Notes on rooms, craft, and considered objects.").slice(0, 155),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: `Aura Living - ${title}`,
      description: (excerpt || "Notes on rooms, craft, and considered objects.").slice(0, 155),
      url: canonical,
      siteName: "Aura Living",
      type: "article",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Aura Living - ${title}`,
      description: (excerpt || "Notes on rooms, craft, and considered objects.").slice(0, 155),
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export { BASE_URL };
