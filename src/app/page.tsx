import type { Metadata } from "next";
import { SiteShell } from "@/components/aura/layout/SiteShell";
import { homeMetadata } from "@/lib/seo-metadata";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { faqs } from "@/data/faq";

export const metadata: Metadata = homeMetadata();

export default function Home() {
  return (
    <>
      <SiteShell initialView="home" />
      <FaqJsonLd
        items={faqs.map((f) => ({ question: f.question, answer: f.answer }))}
      />
    </>
  );
}
