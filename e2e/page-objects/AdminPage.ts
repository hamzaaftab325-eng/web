/**
 * Admin Page Object — encapsulates all interactions with the /admin panel.
 */

import type { Page, Locator } from "@playwright/test";
import { Selectors } from "../helpers/selectors";
import { expect } from "@playwright/test";

export class AdminPage {
  readonly page: Page;
  readonly console: Locator;
  readonly signOut: Locator;

  constructor(page: Page) {
    this.page = page;
    this.console = page.locator(Selectors.admin.console);
    this.signOut = page.locator(Selectors.admin.signOut);
  }

  async goto() {
    await this.page.goto("/admin");
    await expect(this.console).toBeVisible({ timeout: 15000 });
  }

  async navigateTo(section: "dashboard" | "products" | "orders" | "customers" | "settings" | "analytics" | "content") {
    const selectorMap = {
      dashboard: Selectors.admin.navDashboard,
      products: Selectors.admin.navProducts,
      orders: Selectors.admin.navOrders,
      customers: Selectors.admin.navCustomers,
      settings: Selectors.admin.navSettings,
      analytics: Selectors.admin.navAnalytics,
      content: Selectors.admin.navContent,
    } as const;

    const navButton = this.page.locator(selectorMap[section]).first();
    await expect(navButton).toBeVisible();
    await navButton.click();

    const urlMap = {
      dashboard: "/admin",
      products: "/admin/products",
      orders: "/admin/orders",
      customers: "/admin/customers",
      settings: "/admin/settings",
      analytics: "/admin/analytics",
      content: "/admin/content",
    } as const;

    await expect(this.page).toHaveURL(urlMap[section]);
  }

  async logout() {
    await expect(this.signOut).toBeVisible();
    await this.signOut.click();
    await expect(this.page).toHaveURL("/", { timeout: 10000 });
  }

  async expectSectionLoaded(sectionName: string) {
    const heading = this.page.locator(`h1:has-text("${sectionName}"), h2:has-text("${sectionName}")`).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  }
}
