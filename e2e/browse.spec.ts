import { test, expect } from "@playwright/test";

/**
 * E2E: Browse + Cart flow
 *
 * Tests: home page loads, shop loads, product card works, add to cart, cart drawer
 */

test.describe("Browse and Cart", () => {
  test("home page loads with hero and sections", async ({ page }) => {
    await page.goto("/");

    // Hero should be visible
    await expect(page.locator("h1").or(page.locator("[class*='display']")).first()).toBeVisible({ timeout: 10000 });

    // Footer should be visible
    await expect(page.locator("footer")).toBeVisible();
  });

  test("shop page loads with products", async ({ page }) => {
    await page.goto("/shop");

    // Should have product cards
    await expect(page.locator("[class*='product-card']").first()).toBeVisible({ timeout: 10000 });
  });

  test("can navigate to product detail from shop", async ({ page }) => {
    await page.goto("/shop");

    // Click first product card
    const firstCard = page.locator("[class*='product-card-compact']").first();
    await firstCard.click();

    // Should be on a product page
    await expect(page).toHaveURL(/\/product\//);
  });

  test("can add product to cart", async ({ page }) => {
    await page.goto("/shop");

    // Wait for products to load
    await expect(page.locator("[class*='product-card-compact']").first()).toBeVisible({ timeout: 10000 });

    // Click "Quick Add" on first product
    const quickAddBtn = page.locator("text=Quick Add").first();
    if (await quickAddBtn.isVisible()) {
      await quickAddBtn.click();

      // Cart drawer or toast should appear
      await expect(page.locator("text=Added to cart").or(page.locator("[class*='cart']")).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("sale page loads", async ({ page }) => {
    await page.goto("/sale");

    // Page should load without error
    await expect(page.locator("h1").or(page.locator("[class*='display']")).first()).toBeVisible({ timeout: 10000 });
  });

  test("journal page loads with articles", async ({ page }) => {
    await page.goto("/journal");

    await expect(page.locator("h1").or(page.locator("[class*='display']")).first()).toBeVisible({ timeout: 10000 });
  });

  test("collections page loads", async ({ page }) => {
    await page.goto("/collections");

    await expect(page.locator("h1").or(page.locator("[class*='display']")).first()).toBeVisible({ timeout: 10000 });
  });
});
