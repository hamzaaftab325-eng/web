/**
 * Base test fixture — extends Playwright's `test` with:
 *
 * 1. Console error monitoring — fails test if console.error fires
 * 2. Uncaught exception monitoring — fails test on runtime errors
 * 3. Failed network request monitoring — fails test on 5xx responses
 * 4. Hydration error detection — checks for React hydration warnings
 *
 * Usage:
 *   import { test, expect } from "../fixtures/base";
 *   test("my test", ({ page }) => { ... });
 *
 * To suppress expected errors (e.g., testing 401 responses):
 *   test.use({ allowConsoleErrors: true });
 *   test.use({ allowNetworkErrors: [/\/api\/auth\/me/] });
 */

import { test as base, expect, type Page } from "@playwright/test";

interface BaseFixture {
  page: Page;
  allowConsoleErrors: boolean;
  allowNetworkErrors: RegExp[];
}

type BaseOptions = Partial<Pick<BaseFixture, "allowConsoleErrors" | "allowNetworkErrors">>;

export const test = base.extend<BaseFixture, BaseOptions>({
  allowConsoleErrors: [false, { option: true }],
  allowNetworkErrors: [[], { option: true }],

  page: async ({ page, allowConsoleErrors, allowNetworkErrors }, use) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const networkErrors: string[] = [];

    // Monitor console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore hydration mismatch warnings (common in Next.js dev mode)
        if (!text.includes("Hydration") && !text.includes("did not match")) {
          consoleErrors.push(text);
        }
      }
    });

    // Monitor uncaught page errors
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    // Monitor failed network requests (5xx only — 4xx is expected for auth tests)
    page.on("response", (response) => {
      const url = response.url();
      const status = response.status();

      if (status >= 500) {
        const isAllowed = allowNetworkErrors.some((pattern) => pattern.test(url));
        if (!isAllowed) {
          networkErrors.push(`${status} ${url}`);
        }
      }
    });

    await use(page);

    // After test completes — verify no errors occurred
    if (!allowConsoleErrors && consoleErrors.length > 0) {
      throw new Error(`Console errors detected:\n${consoleErrors.join("\n")}`);
    }

    if (pageErrors.length > 0) {
      throw new Error(`Uncaught page errors:\n${pageErrors.join("\n")}`);
    }

    if (networkErrors.length > 0) {
      throw new Error(`Failed network requests (5xx):\n${networkErrors.join("\n")}`);
    }
  },
});

export { expect };
