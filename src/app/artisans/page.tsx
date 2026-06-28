import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { ArtisansView } from "@/components/aura/sections/ArtisansView";

export const metadata: Metadata = pageMetadata("artisans", "/artisans");

export default function ArtisansPage() {
  return <ArtisansView />;
}
