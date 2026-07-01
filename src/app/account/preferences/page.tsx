import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-metadata";
import { AccountPreferences } from "@/components/aura/account/AccountPreferences";

export const metadata: Metadata = pageMetadata("account-preferences", "/account/preferences");

export default function AccountPreferencesPage() {
  return <AccountPreferences />;
}
