import { test as base, expect, type Page } from "@playwright/test";
import { Selectors } from "../helpers/selectors";

const STORAGE_STATE_PATH = "e2e/.auth/admin.json";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@auraliving.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin2026";

/**
 * Authenticated test fixture.
 *
 * Uses storageState saved by globalSetup (runs once before all tests).
 * The saved session contains admin auth cookies — no login needed per test.
 *
 * Usage:
 *   import { test, expect } from "../fixtures/auth";
 *   test("admin test", ({ authedPage }) => {
 *     await authedPage.goto("/admin");
 *     // Already authenticated
 *   });
 */
export const test = base.extend<{
  authedPage: Page;
}>({
  authedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    });
    const page = await context.newPage();

    await use(page);

    await context.close();
  },
});

export { expect, STORAGE_STATE_PATH, ADMIN_EMAIL, ADMIN_PASSWORD };
