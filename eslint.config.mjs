import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,

  // ─── Phase 0: a11y + import plugins installed but configured as warn-only ───
  // Surfaced as warnings so they don't break the build; promoted to errors in Phase 8.
  // NOTE: eslint-config-next already registers the jsx-a11y plugin, so we only add rules here.
  {
    rules: {
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-has-content": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/label-has-associated-control": "warn",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/tabindex-no-positive": "warn",
    },
  },
  {
    plugins: { import: importPlugin },
    rules: {
      "import/order": ["warn", {
        "newlines-between": "always",
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type", "object"],
        alphabetize: { order: "asc", caseInsensitive: true },
        pathGroups: [
          { pattern: "react", group: "external", position: "before" },
          { pattern: "next/**", group: "external", position: "before" },
          { pattern: "@/**", group: "internal", position: "after" },
        ],
        pathGroupsExcludedImportTypes: ["react", "next"],
      }],
    },
  },

  {
    rules: {
      // ─── ABSOLUTE: ZERO inline styles ─────────────────────────────
      "react/forbid-component-props": ["error", {
        forbid: [{ propName: "style", message: "ZERO inline styles. Use a CSS class in globals.css or set CSS custom properties via ref." }]
      }],

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/prefer-as-const": "off",

      // React rules
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/purity": "off",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
      "react-compiler/react-compiler": "off",

      // Next.js rules
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",

      // General JavaScript rules
      "prefer-const": "warn",
      "no-unused-vars": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-empty": "warn",
      "no-irregular-whitespace": "error",
      "no-case-declarations": "off",
      "no-fallthrough": "error",
      "no-mixed-spaces-and-tabs": "warn",
      "no-redeclare": "off",
      "no-undef": "off",
      "no-unreachable": "error",
      "no-useless-escape": "warn",
    },
  },

  {
    files: ["src/components/ui/**/*"],
    rules: { "react/forbid-component-props": "off" },
  },

  // ─── Scripts: allow console.log (CLI tools need stdout output) ───
  {
    files: ["scripts/**/*.{ts,tsx,js,mjs}"],
    rules: {
      "no-console": "off",
      "import/order": "off",
    },
  },

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "examples/**",
      "skills/**",
      // NOTE: scripts/** un-ignored in Phase 1A — utility scripts now subject to
      // the same quality gates as the rest of the codebase. Older scripts
      // (generate-audit-report.js, generate-legal-docx.js) use CommonJS require()
      // and are explicitly exempted below.
      "scripts/generate-audit-report.js",
      "scripts/generate-legal-docx.js",
      ".baseline-tsc.log",
      "playwright-report/**",
      "test-results/**",
    ],
  },
];

export default eslintConfig;
