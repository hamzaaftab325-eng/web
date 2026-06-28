import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { CareView } from "@/components/aura/sections/CareView";

export const metadata: Metadata = pageMetadata("care", "/care");

export default function CarePage() {
  return <CareView />;
}
