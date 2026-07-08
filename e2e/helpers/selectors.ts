/**
 * Shared selector constants for Aura Living E2E tests.
 *
 * Centralizing selectors makes updates trivial — change once here,
 * all tests benefit. Prefer ARIA roles > data-testid > CSS classes.
 */

export const Selectors = {
  // ── Navigation ──────────────────────────────────────────────
  nav: {
    primary: 'nav[aria-label="Primary navigation"]',
    skipLink: ".skip-link",
    mobileMenu: 'button[aria-label="Open menu"]',
  },

  // ── Auth ────────────────────────────────────────────────────
  auth: {
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    submitButton: 'button[type="submit"]',
    rememberToggle: '[role="switch"]',
    errorAlert: '[role="alert"]',
    forgotPasswordLink: 'a:has-text("Forgot password")',
    signupLink: 'button:has-text("Create an account")',
  },

  // ── Admin ───────────────────────────────────────────────────
  admin: {
    console: 'text=Admin Console',
    signOut: 'button:has-text("Sign Out")',
    navDashboard: 'button:has-text("Dashboard")',
    navProducts: 'button:has-text("Products")',
    navOrders: 'button:has-text("Orders")',
    navCustomers: 'button:has-text("Customers")',
    navSettings: 'button:has-text("Settings")',
    navAnalytics: 'button:has-text("Analytics")',
    navContent: 'button:has-text("Content")',
  },

  // ── Commerce ────────────────────────────────────────────────
  commerce: {
    productCard: 'article[role="link"]',
    quickAdd: 'button[aria-label*="Quick add"]',
    cartIcon: 'button[aria-label*="cart"], button[aria-label*="Cart"]',
    cartDrawer: '[role="dialog"]:has-text("Cart")',
    addToCart: 'button:has-text("Add to Cart")',
    checkout: 'button:has-text("Checkout")',
    toast: '[role="status"], [data-sonner-toast]',
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    newsletterInput: "#footer-newsletter-email",
    newsletterLabel: 'label[for="footer-newsletter-email"]',
    subscribeButton: 'button[aria-label="Subscribe"]',
  },

  // ── Display Preferences ─────────────────────────────────────
  display: {
    trigger: 'button[aria-label="Display preferences"]',
    dialog: '[role="dialog"][aria-modal="true"]',
    closeButton: 'button[aria-label="Close display preferences"]',
    themeButtons: '[role="group"][aria-label="Theme"] button',
    contrastButtons: '[role="group"][aria-label="Contrast"] button',
  },

  // ── Common ──────────────────────────────────────────────────
  common: {
    main: "#main, [id='main']",
    heading1: "h1",
    footer: "footer",
    loader: ".aura-loader-ring",
  },
} as const;
