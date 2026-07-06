import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { AccountWishlist } from "@/components/aura/account/AccountWishlist";

export const metadata: Metadata = pageMetadata("account-wishlist", "/account/wishlist");

export default function AccountWishlistPage() {
  return <AccountWishlist />;
}
