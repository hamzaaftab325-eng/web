import { notFound } from "next/navigation";
import { SiteShell } from "@/components/aura/layout/SiteShell";
import { urlToView } from "@/lib/view-url";

/**
 * Catch-all route — renders SiteShell for valid URLs, triggers 404 for unknown.
 *
 * In Next.js 16, params is a Promise and must be awaited.
 * For unknown URLs, notFound() triggers app/not-found.tsx.
 *
 * Valid URLs are defined in src/lib/view-url.ts (viewToUrl / urlToView).
 * The root "/" is handled by app/page.tsx (not this catch-all).
 */

interface CatchAllPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const pathname = "/" + slug.join("/");
  const view = urlToView(pathname);

  if (!view) {
    // Unknown URL — trigger the branded 404 page
    notFound();
  }

  return <SiteShell />;
}
