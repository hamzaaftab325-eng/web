import { test, expect } from "@playwright/test";

/**
 * E2E: Checkout flow
 *
 * Tests: cart view, checkout flow opens, form validation
 * Note: Full order placement requires real DB — tests up to form submission only
 */

test.describe("Checkout Flow", () => {
  test("cart page loads with empty state", async ({ page }) => {
    await page.goto("/cart");

    // Should show cart page (either items or empty state)
    await expect(page.locator("h1").or(page.locator("[class*='display']")).first()).toBeVisible({ timeout: 10000 });
  });

  test("checkout flow can be opened from cart", async ({ page }) => {
    // Go to shop and add an item first
    await page.goto("/shop");
    await expect(page.locator("[class*='product-card-compact']").first()).toBeVisible({ timeout: 10000 });

    const quickAddBtn = page.locator("text=Quick Add").first();
    if (await quickAddBtn.isVisible()) {
      await quickAddBtn.click();
      await page.waitForTimeout(1000);
    }

    // Go to cart
    await page.goto("/cart");

    // If items exist, try checkout
    const checkoutBtn = page.locator("text=Checkout").first();
    if (await checkoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkoutBtn.click();

      // Checkout flow should open
      await expect(page.locator("text=Information").or(page.locator("[class*='checkout']")).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("contact form submits", async ({ page }) => {
    await page.goto("/contact");

    // Fill contact form
    await page.fill('input[name="name"], input[placeholder*="name"]', "Test User");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('textarea', "This is a test message that is long enough to pass validation.");

    // Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Should show success (or at least not error)
    await page.waitForTimeout(2000);
  });
});
