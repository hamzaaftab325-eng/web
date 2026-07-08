import { AccountOrderDetail } from "@/components/aura/account/AccountOrderDetail";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

// noindex — private page, canonical doesn't matter but keep it correct
export const metadata: Metadata = { ...pageMetadata("account-order-detail", "/account/orders"), robots: { index: false, follow: false } };

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountOrderDetail orderId={id} />;
}
