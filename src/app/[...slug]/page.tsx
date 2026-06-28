import { notFound } from "next/navigation";
import { SiteShell } from "@/components/aura/layout/SiteShell";
import { urlToView } from "@/lib/view-url";
import type { ViewKey } from "@/types";

/**
 * Catch-all route — renders SiteShell for valid URLs, triggers 404 for unknown.
 *
 * Passes the `initialView` prop derived from the URL so that SiteShell
 * renders the correct view on the FIRST render (server + client).
 * This prevents the flash-of-wrong-content where the default "home"
 * view would briefly show before the URL→view sync effect runs.
 *
 * In Next.js 16, params is a Promise and must be awaited.
 */

interface CatchAllPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const pathname = "/" + slug.join("/");
  const view = urlToView(pathname);

  if (!view) {
    notFound();
  }

  return <SiteShell initialView={view as ViewKey} />;
}
