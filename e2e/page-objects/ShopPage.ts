/**
 * Shop Page Object — encapsulates all interactions with the /shop page.
 */

import type { Page, Locator } from "@playwright/test";
import { Selectors } from "../helpers/selectors";

export class ShopPage {
  readonly page: Page;
  readonly productCards: Locator;
  readonly main: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCards = page.locator(Selectors.commerce.productCard);
    this.main = page.locator(Selectors.common.main);
  }

  async goto() {
    await this.page.goto("/shop");
    await expect(this.main).toBeVisible({ timeout: 10000 });
  }

  async waitForProducts() {
    await expect(this.productCards.first()).toBeVisible({ timeout: 15000 });
  }

  async getProductCount(): Promise<number> {
    await this.waitForProducts();
    return this.productCards.count();
  }

  async clickFirstProduct() {
    await this.waitForProducts();
    const firstCard = this.productCards.first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(this.page).toHaveURL(/\/product\//);
  }

  async addFirstProductToCart() {
    await this.waitForProducts();
    const quickAdd = this.page.locator(Selectors.commerce.quickAdd).first();
    await expect(quickAdd).toBeVisible();
    await quickAdd.click();
  }
}

import { expect } from "@playwright/test";
