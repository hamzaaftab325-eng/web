import type { Metadata } from "next";
import type { ViewKey } from "@/types";

/**
 * SEO metadata library — per-page metadata for search engines + social.
 *
 * Each view has a curated title, description, and OpenGraph/Twitter config.
 * Canonical URLs are generated from the pathname. hreflang is set to en-US
 * by default (prep for i18n in Phase 9).
 */

const BASE_URL = "https://aura-living-1.vercel.app";

interface PageMeta {
  title: string;
  description: string;
  /** OpenGraph image path (absolute URL or /path). */
  ogImage?: string;
}

const PAGE_META: Record<ViewKey, PageMeta> = {
  home: {
    title: "Aura Living — Considered Objects for the Considered Home",
    description:
      "Premium home décor atelier offering lamps, mirrors, indoor plants, planters, and sculptural objects. Warm minimalism, artisanal craft, sourced from workshops we know by name.",
    ogImage: "/hero/slide-1.png",
  },
  shop: {
    title: "Shop — Aura Living",
    description:
      "Browse the full Aura Living catalogue: lamps, mirrors, ceramics, plants, and sculptural objects. Each piece made by hand in small workshops across Europe and beyond.",
    ogImage: "/hero/shop.png",
  },
  about: {
    title: "About — Aura Living",
    description:
      "Founded in Lahore, Punjab, Aura Living sources slowly from workshops we visit by name. Read the story behind the atelier and the makers who shape every piece.",
    ogImage: "/hero/about.png",
  },
  journal: {
    title: "Journal — Aura Living",
    description:
      "Essays, workshop visits, and care guides from the Aura Living team. Notes on rooms, materials, and slow making — published slowly, read carefully.",
    ogImage: "/hero/journal.png",
  },
  collections: {
    title: "Collections — Aura Living",
    description:
      "Curated selections from the Aura Living catalogue — gathered by palette, purpose, or price. Each collection is a complete point of view.",
    ogImage: "/hero/collections.png",
  },
  sustainability: {
    title: "Sustainability — Aura Living",
    description:
      "Full transparency: materials sourcing index, workshop map, certifications, environmental impact, and dated future commitments. No green-washing.",
    ogImage: "/hero/sustainability.png",
  },
  care: {
    title: "Care Guides — Aura Living",
    description:
      "Seven material-specific care guides — ceramic, brass, wood, linen, plants, stone, and glass. Written by our small team with the same slow standard.",
    ogImage: "/hero/care.png",
  },
  login: {
    title: "Sign In — Aura Living",
    description: "Sign in to your Aura Living account to track orders, save favorites, and check out faster.",
  },
  signup: {
    title: "Create Account — Aura Living",
    description: "Join Aura Living for faster checkout, order tracking, and personalized recommendations.",
  },
  "forgot-password": {
    title: "Forgot Password — Aura Living",
    description: "Reset your Aura Living account password.",
  },
  "reset-password": {
    title: "Reset Password — Aura Living",
    description: "Set a new password for your Aura Living account.",
  },
  account: {
    title: "My Account — Aura Living",
    description: "View your orders, saved addresses, wishlist, and account preferences.",
  },
  "account-orders": {
    title: "Order History — Aura Living",
    description: "View your past orders and track current shipments.",
  },
  "account-order-detail": {
    title: "Order Details — Aura Living",
    description: "Track your order status, view items, and print receipts.",
  },
  "account-addresses": {
    title: "Saved Addresses — Aura Living",
    description: "Manage your shipping and billing addresses.",
  },
  "account-wishlist": {
    title: "Wishlist — Aura Living",
    description: "Your saved pieces, ready to move to cart when the time is right.",
  },
  "account-preferences": {
    title: "Preferences — Aura Living",
    description: "Manage email subscriptions, style preferences, and display settings.",
  },
  "product-detail": {
    title: "Product — Aura Living",
    description: "Handcrafted home décor from Aura Living.",
  },
};

/**
 * Generate full Metadata for a view at a given pathname.
 * Includes title, description, OpenGraph, Twitter, canonical, and hreflang.
 */
export function pageMetadata(view: ViewKey, pathname: string): Metadata {
  const meta = PAGE_META[view] ?? PAGE_META.home;
  const canonical = BASE_URL + pathname;
  const ogImage = meta.ogImage ? (meta.ogImage.startsWith("http") ? meta.ogImage : BASE_URL + meta.ogImage) : BASE_URL + "/hero/slide-1.png";

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
    robots: view.startsWith("account") || view === "login" || view === "signup" || view === "forgot-password" || view === "reset-password"
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
