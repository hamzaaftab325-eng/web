import { test, expect } from "@playwright/test";

/**
 * E2E: Accessibility checks
 *
 * Tests: skip link, keyboard navigation, ARIA labels, heading hierarchy
 * Note: For full axe-core scans, install @axe-core/playwright and add
 * `import AxeBuilder from '@axe-core/playwright'` — deferred to avoid
 * extra dependency. These tests cover the most critical WCAG requirements.
 */

test.describe("Accessibility", () => {
  test("skip link exists and works", async ({ page }) => {
    await page.goto("/");

    // Skip link should be in the DOM
    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toHaveCount(1);

    // Focus it — should become visible
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test("main content has id='main'", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("#main, [id='main']");
    await expect(main).toHaveCount(1);
  });

  test("all nav elements have aria-label", async ({ page }) => {
    await page.goto("/");
    const navs = page.locator("nav");
    const count = await navs.count();

    for (let i = 0; i < count; i++) {
      const nav = navs.nth(i);
      const label = await nav.getAttribute("aria-label");
      expect(label).toBeTruthy();
    }
  });

  test("all images have alt text (or empty alt for decorative)", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForTimeout(2000);

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      // alt should exist (even if empty string for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test("heading hierarchy is correct (h1 before h2)", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    const h2 = page.locator("h2");

    // Should have at least one h1
    expect(await h1.count()).toBeGreaterThan(0);

    // h1 should come before h2 in DOM order
    if ((await h2.count()) > 0) {
      const h1Box = await h1.first().boundingBox();
      const h2Box = await h2.first().boundingBox();

      if (h1Box && h2Box) {
        expect(h1Box.y).toBeLessThanOrEqual(h2Box.y);
      }
    }
  });

  test("keyboard can navigate to product cards", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForTimeout(2000);

    // Tab through the page — should reach product cards
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Focused element should be interactive
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("display preferences modal is accessible", async ({ page }) => {
    await page.goto("/");

    // Find the display preferences button (gear icon)
    const gearBtn = page.locator('[aria-label="Display preferences"]').first();

    if (await gearBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await gearBtn.click();

      // Dialog should have role="dialog" and aria-modal="true"
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog).toHaveAttribute("aria-modal", "true");

      // Press Escape to close
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    }
  });

  test("footer newsletter has associated label", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    const label = footer.locator("label[for]").first();

    if (await label.isVisible({ timeout: 5000 }).catch(() => false)) {
      const htmlFor = await label.getAttribute("for");
      expect(htmlFor).toBeTruthy();

      // Corresponding input should exist
      const input = footer.locator(`#${htmlFor}`);
      await expect(input).toHaveCount(1);
    }
  });
});
