import { AccountWishlist } from "@/components/aura/account/AccountWishlist";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("account-wishlist", "/account/wishlist");

export default function AccountWishlistPage() {
  return <AccountWishlist />;
}
