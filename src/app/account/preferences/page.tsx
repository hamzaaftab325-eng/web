import { AccountPreferences } from "@/components/aura/account/AccountPreferences";
import { pageMetadata } from "@/lib/seo-metadata";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("account-preferences", "/account/preferences");

export default function AccountPreferencesPage() {
  return <AccountPreferences />;
}
