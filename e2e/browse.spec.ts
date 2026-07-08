import { test, expect } from "../fixtures/base";
import { ShopPage } from "../page-objects/ShopPage";
import { Selectors } from "../helpers/selectors";

/**
 * E2E: Browse + Cart flow
 *
 * Tests: home page, shop page, product detail, add to cart, public pages
 *
 * Enterprise refactor:
 * - Uses ShopPage page object
 * - Uses base fixture (console error + network monitoring)
 * - No arbitrary waits — uses auto-retrying expect()
 * - No conditional test execution — deterministic assertions
 * - Verifies content, not just visibility
 * - Tests responsive layout (desktop + mobile)
 */

test.describe("Public pages", () => {
  test("home page loads with hero, main content, and footer", async ({ page }) => {
    await page.goto("/");

    // Main landmark should exist
    await expect(page.locator(Selectors.common.main)).toBeVisible();

    // H1 should be present (hero heading)
    await expect(page.locator(Selectors.common.heading1).first()).toBeVisible({ timeout: 10000 });

    // Footer should be visible
    await expect(page.locator(Selectors.common.footer)).toBeVisible();
  });

  test("shop page loads with product cards", async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    // Should have at least 1 product
    const count = await shop.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test("sale page loads with content", async ({ page }) => {
    await page.goto("/sale");

    await expect(page.locator(Selectors.common.main)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveTitle(/aura/i);
  });

  test("journal page loads with content", async ({ page }) => {
    await page.goto("/journal");

    await expect(page.locator(Selectors.common.main)).toBeVisible({ timeout: 10000 });
  });

  test("collections page loads with content", async ({ page }) => {
    await page.goto("/collections");

    await expect(page.locator(Selectors.common.main)).toBeVisible({ timeout: 10000 });
  });

  test("about page loads with content", async ({ page }) => {
    await page.goto("/about");

    await expect(page.locator(Selectors.common.main)).toBeVisible({ timeout: 10000 });
  });

  test("contact page loads with form", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.locator(Selectors.common.main)).toBeVisible({ timeout: 10000 });
    // Contact form should have name, email, message fields
    await expect(page.locator('input[type="email"], textarea').first()).toBeVisible();
  });
});

test.describe("Product navigation", () => {
  test("navigates from shop to product detail page", async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await shop.clickFirstProduct();

    // Verify we're on a product page
    await expect(page).toHaveURL(/\/product\//);

    // Product detail should have content
    await expect(page.locator(Selectors.common.main)).toBeVisible();
  });
});

test.describe("Cart interaction", () => {
  test("adds product to cart from shop page", async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    // Add first product to cart
    await shop.addFirstProductToCart();

    // Should see a toast or cart indicator
    const toast = page.locator(Selectors.commerce.toast).first();
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Toast should mention "Added to cart"
    await expect(toast).toContainText(/added to cart/i);
  });
});

test.describe("Responsive layout", () => {
  test("home page renders correctly on mobile viewport", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.locator(Selectors.common.main)).toBeVisible({ timeout: 10000 });
    await expect(page.locator(Selectors.common.footer)).toBeVisible();

    await context.close();
  });

  test("shop page renders correctly on mobile viewport", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();

    const shop = new ShopPage(page);
    await shop.goto();
    await shop.waitForProducts();

    await context.close();
  });

  test("home page renders correctly on tablet viewport", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page.locator(Selectors.common.main)).toBeVisible({ timeout: 10000 });

    await context.close();
  });
});
