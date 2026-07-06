import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { AccountOrders } from "@/components/aura/account/AccountOrders";

export const metadata: Metadata = pageMetadata("account-orders", "/account/orders");

export default function AccountOrdersPage() {
  return <AccountOrders />;
}
