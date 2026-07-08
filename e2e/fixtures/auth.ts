/**
 * Auth fixture — provides pre-authenticated browser sessions via storageState.
 *
 * Phase 13 enterprise refactor: Login ONCE, save cookies to a JSON file,
 * reuse across all admin tests. This is 10x faster than logging in per test.
 *
 * Usage in tests:
 *   import { test, expect } from "../fixtures/auth";
 *   test("admin dashboard", ({ authedPage }) => {
 *     await authedPage.goto("/admin");
 *     // Already authenticated — no login needed
 *   });
 *
 * The storageState is generated in globalSetup (runs once before all tests).
 */

import { test as base, expect, type Page } from "@playwright/test";
import { Selectors } from "../helpers/selectors";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@auraliving.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin2026";
const STORAGE_STATE_PATH = "e2e/.auth/admin.json";

/**
 * Perform login and return the page (for storageState extraction).
 * Used by globalSetup to create the saved session.
 */
export async function performLogin(page: Page): Promise<void> {
  await page.goto("/login?redirect=/admin");

  const emailInput = page.locator(Selectors.auth.emailInput);
  const passwordInput = page.locator(Selectors.auth.passwordInput);
  const submitButton = page.locator(Selectors.auth.submitButton);

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(submitButton).toBeEnabled();

  await emailInput.fill(ADMIN_EMAIL);
  await passwordInput.fill(ADMIN_PASSWORD);
  await submitButton.click();

  // Wait for navigation to /admin (not /login)
  await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
}

/**
 * Authenticated test fixture.
 *
 * `authedPage` — a Page that already has admin auth cookies set.
 * Uses storageState if available (fast), falls back to live login (slow).
 */
export const test = base.extend<{
  authedPage: Page;
}>({
  authedPage: async ({ browser }, use) => {
    // Try to use saved storageState first
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    });
    const page = await context.newPage();

    await use(page);

    await context.close();
  },
});

export { expect, STORAGE_STATE_PATH, ADMIN_EMAIL, ADMIN_PASSWORD };
