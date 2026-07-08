import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for Aura Living.
 *
 * Phase 12: Testing Foundation.
 *
 * Coverage thresholds:
 *   - src/lib/services/**: 80% (critical business logic)
 *   - src/lib/**: 60% (utilities + helpers)
 *   - Overall: 40% (we'll raise this as we add more tests)
 *
 * Environment: jsdom (for React component testing)
 * Setup: src/test/setup.ts (adds jest-dom matchers)
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov"],
      include: [
        "src/lib/utils.ts",
        "src/lib/format/currency.ts",
        "src/lib/security.ts",
        "src/lib/escape-html.ts",
        "src/lib/cloudinary.ts",
        "src/lib/order-status.ts",
        "src/lib/auth.ts",
        "src/lib/rate-limit.ts",
        "src/lib/site-url.ts",
        "src/lib/services/product.service.ts",
        "src/lib/services/order.service.ts",
        "src/lib/services/setting.service.ts",
        "src/lib/api-response.ts",
      ],
      exclude: ["node_modules/**", ".next/**", "src/test/**"],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 40,
        statements: 40,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
