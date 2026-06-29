import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: do NOT set `output: "standalone"` — Vercel handles trace output
  // itself, and the standalone server.js is a long-running HTTP server
  // which doesn't fit Vercel's serverless model (causes API routes to hang).
  // Use `build:standalone` + `start:standalone` scripts for self-hosted deploys.
  reactStrictMode: true,
  experimental: {
    viewTransition: true,
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

export default nextConfig;
