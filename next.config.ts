import type { NextConfig } from "next";

// Phase 7D: Bundle analyzer — wraps nextConfig when ANALYZE=true
const withBundleAnalyzer = (config: NextConfig): NextConfig => {
  if (process.env.ANALYZE === "true") {
    // Lazy-import only when analyzing — doesn't affect normal builds
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { default: analyzer } = require("@next/bundle-analyzer");
    return analyzer({ enabled: true })(config);
  }
  return config;
};

const nextConfig: NextConfig = {
  // NOTE: do NOT set `output: "standalone"` — Vercel handles trace output
  // itself, and the standalone server.js is a long-running HTTP server
  // which doesn't fit Vercel's serverless model (causes API routes to hang).
  // Use `build:standalone` + `start:standalone` scripts for self-hosted deploys.
  reactStrictMode: true,

  // Phase 4E: Removed experimental.viewTransition.
  // The app uses framer-motion's <AnimatePresence> in AppChrome for page
  // transitions. Having BOTH enabled caused a "double animation" — the old
  // page would start exiting via framer-motion while the new page also
  // animated via the View Transitions API, adding ~300ms to every navigation
  // and resetting client state (scroll position, form drafts) on every route
  // change. We chose framer-motion for broader browser support + finer control.
  //
  // To re-enable View Transitions in the future:
  //   1. Remove the <AnimatePresence> wrapper in src/components/aura/layout/AppChrome.tsx
  //   2. Set experimental.viewTransition: true here
  //   3. Test that client state persists across navigations

  // Phase 4F: Explicit compress + poweredByHeader for production hardening.
  // (Vercel sets these by default, but explicit is better — and matters for
  // self-hosted deploys via build:standalone.)
  compress: true,
  poweredByHeader: false,

  // Security headers + API cache headers
  async headers() {
    return [
      {
        // Security headers for all routes
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.cloudinary.com https://vitals.vercel-insights.com https://www.google-analytics.com https://connect.facebook.net; frame-ancestors 'none';",
          },
        ],
      },
      {
        // Cache public content APIs (60s browser + 300s stale-while-revalidate)
        source: "/api/content/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        // Cache public catalog APIs (products, categories, collections)
        source: "/api/products",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/api/categories",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/api/collections",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        // Cache public settings (60s — settings change rarely)
        source: "/api/settings",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
