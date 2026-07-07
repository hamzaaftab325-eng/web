import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

/**
 * app/robots.ts — dynamic robots.txt.
 *
 * Allows all crawlers, points them to the sitemap, and
 * disallows account + auth pages (private user content).
 *
 * Phase 10A: Uses getSiteUrl() instead of hardcoded URL.
 */

const BASE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/admin",
          "/api",
          "/cart",
          "/checkout",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
