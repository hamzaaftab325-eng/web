import { AccountOrders } from "@/components/aura/account/AccountOrders";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("account-orders", "/account/orders");

export default function AccountOrdersPage() {
  return <AccountOrders />;
}
