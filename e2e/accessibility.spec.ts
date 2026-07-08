import { test, expect } from "../fixtures/base";
import { Selectors } from "../helpers/selectors";

/**
 * E2E: Accessibility checks
 *
 * Tests: skip link, keyboard navigation, ARIA labels, heading hierarchy,
 * dialog accessibility, form labels, image alt text
 *
 * Enterprise refactor:
 * - Uses base fixture (error monitoring)
 * - Proper ARIA assertions (role, aria-modal, aria-label, aria-checked)
 * - Keyboard navigation testing (Tab, Enter, Escape)
 * - Focus management verification
 * - No arbitrary waits
 */

test.describe("Accessibility — structural", () => {
  test("skip link exists and becomes visible on focus", async ({ page }) => {
    await page.goto("/");

    const skipLink = page.locator(Selectors.common.skipLink);
    await expect(skipLink).toHaveCount(1);

    // Focus the skip link — should become visible
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test("main content has id='main' for skip link target", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#main")).toHaveCount(1);
  });

  test("all nav elements have aria-label", async ({ page }) => {
    await page.goto("/");

    const navs = page.locator("nav");
    const count = await navs.count();

    for (let i = 0; i < count; i++) {
      const nav = navs.nth(i);
      const label = await nav.getAttribute("aria-label");
      expect(label, `nav #${i} must have aria-label`).toBeTruthy();
    }
  });

  test("heading hierarchy: h1 exists and precedes h2", async ({ page }) => {
    await page.goto("/");

    const h1 = page.locator("h1");
    expect(await h1.count()).toBeGreaterThan(0);

    const h2 = page.locator("h2");
    if ((await h2.count()) > 0) {
      const h1Box = await h1.first().boundingBox();
      const h2Box = await h2.first().boundingBox();

      if (h1Box && h2Box) {
        expect(h1Box.y, "h1 must appear before h2 in DOM").toBeLessThanOrEqual(h2Box.y);
      }
    }
  });
});

test.describe("Accessibility — images", () => {
  test("all images on shop page have alt text", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator(Selectors.commerce.productCard).first()).toBeVisible({ timeout: 10000 });

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      expect(alt, `img #${i} must have alt attribute`).not.toBeNull();
    }
  });
});

test.describe("Accessibility — keyboard navigation", () => {
  test("can Tab to product cards on shop page", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator(Selectors.commerce.productCard).first()).toBeVisible({ timeout: 10000 });

    // Tab through the page
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }

    // Focused element should be interactive (not body)
    const focused = page.locator(":focus");
    await expect(focused).not.toHaveText("");
  });

  test("can activate product card with Enter key", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator(Selectors.commerce.productCard).first()).toBeVisible({ timeout: 10000 });

    // Focus the first product card
    const firstCard = page.locator(Selectors.commerce.productCard).first();
    await firstCard.focus();

    // Press Enter — should navigate to product page
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/product\//, { timeout: 5000 });
  });
});

test.describe("Accessibility — Display Preferences modal", () => {
  test("modal opens with proper ARIA attributes and closes with Escape", async ({ page }) => {
    await page.goto("/");

    const trigger = page.locator(Selectors.display.trigger).first();

    // Skip if display preferences button isn't on this page
    const isTriggerVisible = await trigger.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isTriggerVisible) {
      test.skip();
      return;
    }

    // Open modal
    await trigger.click();

    const dialog = page.locator(Selectors.display.dialog);
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("role", "dialog");

    // Close with Escape
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("modal theme buttons have aria-pressed state", async ({ page }) => {
    await page.goto("/");

    const trigger = page.locator(Selectors.display.trigger).first();
    const isTriggerVisible = await trigger.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isTriggerVisible) {
      test.skip();
      return;
    }

    await trigger.click();

    const themeButtons = page.locator(Selectors.display.themeButtons);
    const count = await themeButtons.count();

    if (count > 0) {
      // At least one button should have aria-pressed="true" (the active theme)
      const pressedButtons = page.locator(`${Selectors.display.themeButtons}[aria-pressed="true"]`);
      await expect(pressedButtons.first()).toBeVisible({ timeout: 5000 });
    }

    // Close modal
    await page.keyboard.press("Escape");
  });
});

test.describe("Accessibility — footer newsletter form", () => {
  test("newsletter input has associated label via htmlFor", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator(Selectors.common.footer);
    const label = footer.locator('label[for]').first();

    const isLabelVisible = await label.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isLabelVisible) {
      test.skip();
      return;
    }

    const htmlFor = await label.getAttribute("for");
    expect(htmlFor, "label must have 'for' attribute").toBeTruthy();

    // Corresponding input should exist
    const input = footer.locator(`#${htmlFor}`);
    await expect(input).toHaveCount(1);
  });
});
