import type { Metadata } from "next";
import { CartView } from "@/components/aura/commerce/CartView";

export const metadata: Metadata = {
  title: "Aura Living - Shopping Cart",
  description: "Review your cart and proceed to checkout.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartView />;
}
