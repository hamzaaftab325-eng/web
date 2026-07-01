import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { CollectionsView } from "@/components/aura/sections/CollectionsView";

export const metadata: Metadata = pageMetadata("collections", "/collections");

export default function CollectionsPage() {
  return <CollectionsView />;
}
