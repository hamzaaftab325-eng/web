import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { JournalView } from "@/components/aura/sections/JournalView";

export const metadata: Metadata = pageMetadata("journal", "/journal");

export default function JournalPage() {
  return <JournalView />;
}
