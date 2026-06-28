import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { SustainabilityView } from "@/components/aura/sections/SustainabilityView";

export const metadata: Metadata = pageMetadata("sustainability", "/sustainability");

export default function SustainabilityPage() {
  return <SustainabilityView />;
}
