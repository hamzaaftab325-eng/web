import { AccountAddresses } from "@/components/aura/account/AccountAddresses";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("account-addresses", "/account/addresses");

export default function AccountAddressesPage() {
  return <AccountAddresses />;
}
