import type { Metadata } from "next";
import type { ViewKey } from "@/types";

/**
 * SEO metadata library — per-page metadata for search engines + social.
 *
 * Title format: "Page Name | Aura Living" (professional, brand-last)
 * Home page: "Aura Living | Considered Objects for the Considered Home"
 * Descriptions: max 150 characters, professional, keyword-rich.
 */

const BASE_URL = "https://aura-living-1.vercel.app";

interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
}

const PAGE_META: Record<ViewKey, PageMeta> = {
  home: {
    title: "Aura Living | Considered Objects for the Considered Home",
    description:
      "Premium home décor atelier. Handcrafted lamps, mirrors, planters, and sculptural objects. Warm minimalism, artisanal craft, made to be lived with.",
    ogImage: "/hero/slide-1.webp",
  },
  shop: {
    title: "Shop All Products | Aura Living",
    description:
      "Browse handcrafted lamps, mirrors, ceramics, planters, and décor. Each piece sourced from small workshops. Cash on delivery across Pakistan.",
    ogImage: "/hero/shop.webp",
  },
  about: {
    title: "Our Story | Aura Living",
    description:
      "Founded in Lahore, Aura Living sources slowly from workshops we visit by name. Meet the makers behind every lamp, mirror, and planter.",
    ogImage: "/hero/about.webp",
  },
  journal: {
    title: "Journal | Aura Living",
    description:
      "Essays on slow living, material care, and interior design. Notes on rooms, craft, and considered objects from the Aura Living atelier.",
    ogImage: "/hero/journal.webp",
  },
  collections: {
    title: "Collections | Aura Living",
    description:
      "Curated selections of lamps, mirrors, and ceramics. Each collection is a complete point of view — gathered by palette, purpose, or season.",
    ogImage: "/hero/collections.webp",
  },
  care: {
    title: "Care Guides | Aura Living",
    description:
      "Material-specific care guides for ceramic, brass, wood, linen, plants, and glass. Keep your pieces beautiful for years to come.",
    ogImage: "/hero/care.webp",
  },
  login: {
    title: "Sign In | Aura Living",
    description: "Sign in to track orders, save favorites, and check out faster.",
  },
  signup: {
    title: "Create Account | Aura Living",
    description: "Join Aura Living for faster checkout, order tracking, and personalized picks.",
  },
  "forgot-password": {
    title: "Forgot Password | Aura Living",
    description: "Reset your Aura Living account password securely.",
  },
  "reset-password": {
    title: "Reset Password | Aura Living",
    description: "Set a new password for your Aura Living account.",
  },
  account: {
    title: "My Account | Aura Living",
    description: "View orders, manage addresses, track shipments, and update preferences.",
  },
  "account-orders": {
    title: "Order History | Aura Living",
    description: "View your past orders and track current shipments.",
  },
  "account-order-detail": {
    title: "Order Details | Aura Living",
    description: "Track your order status, view items, and download receipts.",
  },
  "account-addresses": {
    title: "Saved Addresses | Aura Living",
    description: "Manage your shipping and billing addresses for faster checkout.",
  },
  "account-wishlist": {
    title: "Wishlist | Aura Living",
    description: "Your saved pieces, ready to move to cart when the time is right.",
  },
  "account-preferences": {
    title: "Preferences | Aura Living",
    description: "Manage email subscriptions, style preferences, and display settings.",
  },
  "account-privacy": {
    title: "Data & Privacy | Aura Living",
    description: "Download your data or permanently delete your account. Your privacy, your control.",
  },
  "product-detail": {
    title: "Product | Aura Living",
    description: "Handcrafted home décor from Aura Living. Made by hand, made to last.",
  },
};

/**
 * Generate full Metadata for a view at a given pathname.
 */
export function pageMetadata(view: ViewKey, pathname: string): Metadata {
  const meta = PAGE_META[view] ?? PAGE_META.home;
  const canonical = BASE_URL + pathname;
  const ogImage = meta.ogImage
    ? meta.ogImage.startsWith("http")
      ? meta.ogImage
      : BASE_URL + meta.ogImage
    : BASE_URL + "/hero/slide-1.webp";

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: pathname,
      languages: {
        "en-US": canonical,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      siteName: "Aura Living",
      type: "website",
      images: [{ url: ogImage, width: 1344, height: 768, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [ogImage],
    },
    robots:
      view.startsWith("account") ||
      view === "login" ||
      view === "signup" ||
      view === "forgot-password" ||
      view === "reset-password"
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

export { BASE_URL };
