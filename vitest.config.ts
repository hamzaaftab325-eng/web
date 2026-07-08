import path from "path";
import { fileURLToPath } from "url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest configuration for Aura Living.
 *
 * Phase 12: Testing Foundation.
 * Phase 12 fix: Removed setupFiles — was breaking on Windows paths with spaces.
 * jest-dom matchers will be added when we write component tests.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
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
