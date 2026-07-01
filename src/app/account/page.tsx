import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { AccountDashboard } from "@/components/aura/account/AccountDashboard";

export const metadata: Metadata = pageMetadata("account", "/account");

export default function AccountPage() {
  return <AccountDashboard />;
}
