import type { MetadataRoute } from "next";

/**
 * app/robots.ts — dynamic robots.txt.
 *
 * Allows all crawlers, points them to the sitemap, and
 * disallows account + auth pages (private user content).
 */

const BASE_URL = "https://aura-living-1.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/login", "/signup", "/forgot-password", "/reset-password"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
