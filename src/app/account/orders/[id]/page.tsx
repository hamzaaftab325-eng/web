import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { AccountOrderDetail } from "@/components/aura/account/AccountOrderDetail";

export const metadata: Metadata = pageMetadata("account-order-detail", "/account/orders");

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountOrderDetail orderId={id} />;
}
