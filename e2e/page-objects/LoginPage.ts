/**
 * Login Page Object — encapsulates all interactions with the /login page.
 *
 * Page Objects centralize UI interactions so that when the UI changes,
 * you update ONE file instead of hunting through every test.
 */

import type { Page, Locator } from "@playwright/test";
import { Selectors } from "../helpers/selectors";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly rememberToggle: Locator;
  readonly errorAlert: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator(Selectors.auth.emailInput);
    this.passwordInput = page.locator(Selectors.auth.passwordInput);
    this.submitButton = page.locator(Selectors.auth.submitButton);
    this.rememberToggle = page.locator(Selectors.auth.rememberToggle).first();
    this.errorAlert = page.locator(Selectors.auth.errorAlert);
    this.forgotPasswordLink = page.locator(Selectors.auth.forgotPasswordLink);
    this.signupLink = page.locator(Selectors.auth.signupLink);
  }

  async goto(redirect?: string) {
    await this.page.goto(redirect ? `/login?redirect=${redirect}` : "/login");
    await expect(this.emailInput).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  async expectError(message: RegExp) {
    await expect(this.errorAlert).toBeVisible({ timeout: 5000 });
    await expect(this.errorAlert).toContainText(message);
  }

  async expectRedirect(url: RegExp) {
    await expect(this.page).toHaveURL(url, { timeout: 15000 });
  }

  async toggleRememberMe() {
    await this.rememberToggle.click();
  }

  async expectRememberMeChecked() {
    await expect(this.rememberToggle).toHaveAttribute("aria-checked", "true");
  }
}
