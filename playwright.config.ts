import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration for Aura Living.
 *
 * Option B: Tests run against the LIVE production site.
 * No local dev server or database needed — just run `npx playwright test`.
 *
 * The globalSetup logs in as admin ONCE and saves the session.
 * All admin tests reuse that saved session (storageState).
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "https://aura-living-1.vercel.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: "browse.spec.ts",
    },
  ],
  // No webServer — testing against live production site
});
