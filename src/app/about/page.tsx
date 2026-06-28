import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { AboutView } from "@/components/aura/sections/AboutView";

export const metadata: Metadata = pageMetadata("about", "/about");

export default function AboutPage() {
  return <AboutView />;
}
