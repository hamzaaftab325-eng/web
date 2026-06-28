import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { AccountOrderDetail } from "@/components/aura/account/AccountOrderDetail";

export const metadata: Metadata = pageMetadata("account-order-detail", "/account/orders");

export default function AccountOrderDetailPage({ params }: { params: { id: string } }) {
  return <AccountOrderDetail orderId={params.id} />;
}
