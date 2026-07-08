import { test, expect } from "@playwright/test";

/**
 * E2E: Admin panel
 *
 * Tests: admin login, dashboard loads, product list loads, orders list loads
 * Prerequisites: Admin user exists (admin@auraliving.com / admin2026)
 */

const ADMIN_EMAIL = "admin@auraliving.com";
const ADMIN_PASSWORD = "admin2026";

async function adminLogin(page: import("@playwright/test").Page) {
  await page.goto("/login?redirect=/admin");
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 15000 });
}

test.describe("Admin Panel", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("admin dashboard loads with stats", async ({ page }) => {
    await expect(page.locator("text=Admin Console")).toBeVisible({ timeout: 10000 });
    // Dashboard should show some stats or nav items
    await expect(page.locator("text=Dashboard").or(page.locator("text=Products")).first()).toBeVisible();
  });

  test("admin products page loads", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page.locator("text=Products").or(page.locator("h1")).first()).toBeVisible({ timeout: 10000 });
  });

  test("admin orders page loads", async ({ page }) => {
    await page.goto("/admin/orders");
    await expect(page.locator("text=Orders").or(page.locator("h1")).first()).toBeVisible({ timeout: 10000 });
  });

  test("admin customers page loads", async ({ page }) => {
    await page.goto("/admin/customers");
    await expect(page.locator("text=Customers").or(page.locator("h1")).first()).toBeVisible({ timeout: 10000 });
  });

  test("admin settings page loads", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.locator("text=Settings").or(page.locator("h1")).first()).toBeVisible({ timeout: 10000 });
  });

  test("admin analytics page loads", async ({ page }) => {
    await page.goto("/admin/analytics");
    await expect(page.locator("text=Analytics").or(page.locator("h1")).first()).toBeVisible({ timeout: 10000 });
  });

  test("admin content page loads", async ({ page }) => {
    await page.goto("/admin/content");
    await expect(page.locator("text=Content").or(page.locator("h1")).first()).toBeVisible({ timeout: 10000 });
  });
});
