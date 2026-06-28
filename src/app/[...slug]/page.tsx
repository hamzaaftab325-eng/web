import { SiteShell } from "@/components/aura/layout/SiteShell";

/**
 * Catch-all route — renders SiteShell for all non-root URLs.
 *
 * SiteShell reads the URL via usePathname() and derives the correct
 * view. This enables shareable URLs like /sustainability, /about,
 * /shop, /account/orders, etc.
 *
 * The root route "/" is handled by app/page.tsx.
 */

export default function CatchAllPage() {
  return <SiteShell />;
}
