import type { MetadataRoute } from "next";

/**
 * PWA Web App Manifest.
 *
 * Enables "Add to Home Screen" on mobile and installable app behavior
 * on desktop. Icons referenced from /public/icons/.
 *
 * To generate icons, run: bun run scripts/gen-icons.ts
 * (or add 192x192 and 512x512 PNGs to /public/icons/)
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aura Living — Considered Objects for the Considered Home",
    short_name: "Aura Living",
    description:
      "Premium home décor atelier. Warm minimalism, artisanal craft, sourced from workshops we know by name.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F0",
    theme_color: "#D4AF37",
    orientation: "portrait-primary",
    categories: ["shopping", "lifestyle", "home"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Shop",
        url: "/shop",
        description: "Browse the full catalogue",
      },
      {
        name: "Collections",
        url: "/collections",
        description: "Curated edits",
      },
      {
        name: "About",
        url: "/about",
        description: "Our story",
      },
    ],
  };
}
