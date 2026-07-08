import { chromium, type FullConfig } from "@playwright/test";
import { Selectors } from "./helpers/selectors";

/**
 * Global setup — runs ONCE before all tests.
 *
 * Logs in as admin on the live site, saves the authenticated session
 * (cookies + localStorage) to a JSON file. All admin tests reuse this
 * saved session via storageState — no per-test login needed.
 *
 * This makes admin tests 10x faster (one login vs N logins).
 */

const BASE_URL = "https://aura-living-1.vercel.app";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@auraliving.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin2026";
const STORAGE_STATE_PATH = "e2e/.auth/admin.json";

export default async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  console.log("[global-setup] Logging in as admin...");

  // Use full URL for globalSetup (Playwright context doesn't inherit baseURL from config here)
  await page.goto(`${BASE_URL}/login?redirect=/admin`);

  await page.locator(Selectors.auth.emailInput).fill(ADMIN_EMAIL);
  await page.locator(Selectors.auth.passwordInput).fill(ADMIN_PASSWORD);
  await page.locator(Selectors.auth.submitButton).click();

  // Wait for redirect to /admin
  await page.waitForURL(/\/admin/, { timeout: 20000 });

  // Verify admin console is visible
  await page.locator(Selectors.admin.console).waitFor({ timeout: 10000 });

  console.log("[global-setup] Login successful. Saving session...");

  // Save the authenticated session
  await context.storageState({ path: STORAGE_STATE_PATH });

  console.log("[global-setup] Session saved to", STORAGE_STATE_PATH);

  await browser.close();
}
