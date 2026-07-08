
import { CartView } from "@/components/aura/commerce/CartView";
import { getSiteUrl } from "@/lib/site-url";

import type { Metadata } from "next";

// Phase 10E: Absolute canonical URL (was relative "/cart")
const BASE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: "Aura Living - Shopping Cart",
  description: "Review your cart and proceed to checkout.",
  alternates: { canonical: `${BASE_URL}/cart` },
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartView />;
}
