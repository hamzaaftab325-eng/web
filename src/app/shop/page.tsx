import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { ShopView } from "@/components/aura/sections/ShopView";

export const metadata: Metadata = pageMetadata("shop", "/shop");

export default function ShopPage() {
  return <ShopView />;
}
