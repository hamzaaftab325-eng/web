import { test, expect } from "@playwright/test";

/**
 * E2E: Authentication flow
 *
 * Tests: login, logout, redirect protection, remember me
 * Prerequisites: Admin user exists (admin@auraliving.com)
 */

const ADMIN_EMAIL = "admin@auraliving.com";
const ADMIN_PASSWORD = "admin2026";

test.describe("Authentication", () => {
  test("should redirect to login when visiting /admin without auth", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveURL(/redirect=\/admin/);
  });

  test("should login as admin and redirect to /admin", async ({ page }) => {
    await page.goto("/login?redirect=/admin");

    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Should land on /admin (not /login)
    await page.waitForURL("/admin", { timeout: 15000 });
    await expect(page).toHaveURL(/\/admin/);

    // Admin console should be visible
    await expect(page.locator("text=Admin Console")).toBeVisible({ timeout: 10000 });
  });

  test("should show error for wrong password", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[role="alert"]')).toContainText(/invalid credentials/i);
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Click sign out
    await page.click('text=Sign Out');

    // Should be redirected to home
    await page.waitForURL("/", { timeout: 10000 });

    // Visiting /admin again should redirect to login
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should remember me checkbox be toggleable", async ({ page }) => {
    await page.goto("/login");

    const rememberToggle = page.locator('[role="switch"]').first();
    await rememberToggle.click();

    // Toggle should have aria-checked="true"
    await expect(rememberToggle).toHaveAttribute("aria-checked", "true");
  });
});
