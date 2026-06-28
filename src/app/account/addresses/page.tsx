import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { AccountAddresses } from "@/components/aura/account/AccountAddresses";

export const metadata: Metadata = pageMetadata("account-addresses", "/account/addresses");

export default function AccountAddressesPage() {
  return <AccountAddresses />;
}
