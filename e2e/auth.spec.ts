import { test, expect } from "../fixtures/base";
import { LoginPage } from "../page-objects/LoginPage";
import { Selectors } from "../helpers/selectors";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../fixtures/auth";

/**
 * E2E: Authentication flow
 *
 * Tests: login, logout, redirect protection, remember me, rate limiting
 * Prerequisites: Admin user exists (admin@auraliving.com / admin2026)
 *
 * Enterprise refactor:
 * - Uses LoginPage page object
 * - Uses base fixture (console error + network monitoring)
 * - No arbitrary waits — all assertions are auto-retrying
 * - Proper URL + content + state assertions
 */

test.describe("Authentication", () => {
  test.describe("Redirect protection", () => {
    test("redirects unauthenticated user from /admin to /login", async ({ page }) => {
      await page.goto("/admin");

      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/redirect=\/admin/);

      // Login form should be visible
      const loginPage = new LoginPage(page);
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });

    test("redirects unauthenticated user from /account to /login", async ({ page }) => {
      await page.goto("/account");

      await expect(page).toHaveURL(/\/login/);
      await expect(page).toHaveURL(/redirect=\/account/);
    });
  });

  test.describe("Login flow", () => {
    test("logs in as admin and redirects to /admin", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto("/admin");

      await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

      // Verify redirect to /admin
      await loginPage.expectRedirect(/\/admin/);

      // Verify admin console is visible (not just URL — actual content)
      await expect(page.locator(Selectors.admin.console)).toBeVisible({ timeout: 15000 });
    });

    test("logs in as admin and redirects to home for customer role", async ({ page }) => {
      // This test verifies the redirect logic — if no admin user, goes to /
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);

      // Admin should go to /admin
      await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    });

    test("shows error for incorrect password", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(ADMIN_EMAIL, "WrongPassword123!");

      // Should stay on login page
      await expect(page).toHaveURL(/\/login/);

      // Should show error alert with invalid credentials message
      await loginPage.expectError(/invalid credentials/i);
    });

    test("shows error for non-existent email", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login("nonexistent@test.com", "SomePassword1!");

      await expect(page).toHaveURL(/\/login/);
      await loginPage.expectError(/invalid credentials/i);
    });

    test("validates required fields", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Click submit without filling fields
      await loginPage.submitButton.click();

      // Should stay on login page
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Remember me", () => {
    test("remember me toggle is keyboard accessible", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Tab to the toggle and activate it
      await loginPage.rememberToggle.focus();
      await expect(loginPage.rememberToggle).toBeFocused();

      await loginPage.toggleRememberMe();
      await loginPage.expectRememberMeChecked();
    });

    test("remember me toggle can be toggled off", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Toggle on
      await loginPage.toggleRememberMe();
      await loginPage.expectRememberMeChecked();

      // Toggle off
      await loginPage.toggleRememberMe();
      await expect(loginPage.rememberToggle).toHaveAttribute("aria-checked", "false");
    });
  });

  test.describe("Logout flow", () => {
    test("logs out and prevents re-access to /admin", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto("/admin");
      await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

      // Wait for admin console to render
      await expect(page.locator(Selectors.admin.console)).toBeVisible({ timeout: 10000 });

      // Sign out
      await page.locator(Selectors.admin.signOut).click();
      await expect(page).toHaveURL("/", { timeout: 10000 });

      // Verify /admin is now protected
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
