import { AccountDashboard } from "@/components/aura/account/AccountDashboard";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("account", "/account");

export default function AccountPage() {
  return <AccountDashboard />;
}
