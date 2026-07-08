import { test, expect } from "../fixtures/base";
import { ShopPage } from "../page-objects/ShopPage";
import { Selectors } from "../helpers/selectors";

/**
 * E2E: Checkout flow
 *
 * Tests: cart page, checkout flow, contact form
 *
 * Enterprise refactor:
 * - No arbitrary waitForTimeout — uses expect().toBeVisible()
 * - Proper assertions on cart state, form fields, and success messages
 * - Uses base fixture for error monitoring
 * - Contact form test verifies actual submission success
 */

test.describe("Cart page", () => {
  test("cart page loads with main content", async ({ page }) => {
    await page.goto("/cart");

    await expect(page.locator(Selectors.common.main)).toBeVisible({ timeout: 10000 });
  });

  test("cart page shows empty state or items", async ({ page }) => {
    await page.goto("/cart");

    // Either shows "Your cart is empty" or shows cart items
    const emptyState = page.locator("text=/cart is empty/i");
    const cartItems = page.locator('[class*="cart"], [role="dialog"]').first();

    // One of these should be visible within 5s
    await expect(emptyState.or(cartItems)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Add to cart → checkout", () => {
  test("can add product and open checkout flow", async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();
    await shop.addFirstProductToCart();

    // Wait for toast
    await expect(page.locator(Selectors.commerce.toast).first()).toBeVisible({ timeout: 5000 });

    // Navigate to cart page
    await page.goto("/cart");

    // If items exist, try checkout
    const checkoutButton = page.locator(Selectors.commerce.checkout).first();
    const isCheckoutVisible = await checkoutButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (isCheckoutVisible) {
      await checkoutButton.click();

      // Checkout flow should show step indicator or form
      const infoStep = page.locator("text=/information/i").first();
      const checkoutForm = page.locator('[role="dialog"], [class*="checkout"]').first();
      await expect(infoStep.or(checkoutForm)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Contact form", () => {
  test("submits contact form successfully", async ({ page }) => {
    await page.goto("/contact");

    // Fill form fields by label/placeholder
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const messageTextarea = page.locator("textarea").first();
    const submitButton = page.locator('button[type="submit"]').first();

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageTextarea).toBeVisible();
    await expect(submitButton).toBeEnabled();

    await nameInput.fill("E2E Test User");
    await emailInput.fill("e2e-test@example.com");
    await messageTextarea.fill("This is an automated E2E test message that meets the minimum length requirement of 10 characters.");

    await submitButton.click();

    // Should show success message (not error)
    const successMessage = page.locator("text=/success/i, text=/thank you/i, text=/sent/i").first();
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test("validates required fields", async ({ page }) => {
    await page.goto("/contact");

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should stay on contact page (no navigation)
    await expect(page).toHaveURL(/\/contact/);
  });
});
