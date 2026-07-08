import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration for Aura Living.
 *
 * Phase 13: E2E Tests.
 *
 * Tests run against the local dev server (http://localhost:3000).
 * In CI, they run against a preview deployment.
 *
 * Run: npx playwright test
 * Run with UI: npx playwright test --ui
 * Run specific file: npx playwright test e2e/auth.spec.ts
 */

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
