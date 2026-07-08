# Changelog

All notable changes to Aura Living are documented in this file.

## [0.3.0] — 2026-07-08

### Phase 0 — Safety Net
- Created `production-hardening` branch off `main`
- Installed 19 dev dependencies (vitest, playwright, @upstash/redis, @sentry/nextjs, pino, etc.)
- Created `.github/workflows/ci.yml` (lint + tsc + build on every PR)
- Created `.github/CODEOWNERS` + `.github/PULL_REQUEST_TEMPLATE.md`
- Wired husky `pre-push` hook to run `scripts/verify.sh`
- Added 8 new scripts to `package.json` (typecheck, verify, test, test:e2e, analyze, etc.)
- Updated ESLint with jsx-a11y + import-order rules
- Fixed `verify.sh` (bunx tsc, ts-ignore check, JSDoc filtering, scripts console.log exempt)

### Phase 1 — Critical Security Fixes
- Scrubbed hardcoded credentials from 6 scripts (Supabase, Cloudinary, admin password)
- Fixed stored XSS in admin invoice (escapeHtml on all interpolations)
- Fixed broken `/sale` page (FlashSaleBannerLoader → FlashSaleBanner)
- Removed refresh-token bypass in 4 routes (auth/me, notifications)
- Added distributed rate limiting via Upstash Redis (10 endpoints)
- Protected `/api/health/integrations` with requireAdmin
- Fixed `/api/reviews/*/helpful/*` IDOR (added auth + integrity check)
- Wrapped `/api/user/data/delete` in `db.$transaction`
- Fixed `userCache` memory leak + wired `invalidateUserCache`
- Added 5MB body-size limit on product import
- Created `src/lib/site-url.ts` (fail-fast if NEXT_PUBLIC_SITE_URL missing)

### Phase 2 — Database Schema Reconciliation
- Removed 11 dropped models from `schema.prisma`
- Added `@unique` on `EmailSubscriber.email` + `unsubscribeToken` field
- Added `WishlistShare` model (random shareId, not reversible base64)
- Added `onDelete: SetNull` on `Review.user` + `OrderItem.product`
- Added `updatedAt` on `OrderItem`
- Converted 3 enum columns to TEXT (OrderStatus, PaymentStatus, PromoCodeType)
- Switched from `db:push` to `db:migrate` (migration-based workflow)
- Generated baseline migration + migration_lock.toml
- Refactored subscribe route to use `upsert` (no TOCTOU)
- Refactored wishlist share to use random token
- Implemented unsubscribe token verification

### Phase 3 — Backend Hardening
- Created Zod validators (auth, order, product, review, address, journal)
- Created `api-response.ts` (consistent response helpers + `safeError`)
- Created `order.service.ts` + `setting.service.ts`
- Exported `toListItem` from product service
- Created `order-status.ts` (single source of truth, replaced 3-way duplication)
- Converted hard delete to soft delete on questions route
- Fixed `revalidatePath` try/catch with per-path logging
- Replaced `Record<string, unknown>` with `Prisma.XxxWhereInput` (5 sites)

### Phase 4 — Next.js Modernization
- Fixed login redirect loop (auth store check before API call)
- Replaced `force-dynamic` on product pages with ISR (`revalidate: 3600`)
- Added Suspense boundaries on home page personalization sections
- Added segment error boundaries (shop, account, journal)
- Removed `experimental.viewTransition` (conflicted with framer-motion)
- Added `compress: true` + `poweredByHeader: false`

### Phase 5 — React Engineering
- Split all 5 oversized files (SignupView, ProductDetailPage, CheckoutFlow, AccountAddresses, admin/analytics)
- Created 6 reusable components (PasswordStrengthMeter, SquareToggle, ProductGallery, CheckoutOrderSummary, DeleteAddressDialog, _components)
- Fixed ProductCard memoization + cart selector (prevents N re-renders per cart mutation)
- Removed dead state from UI store (activeOrderId, openOrder)
- Created shared `EmptyState` component
- Created TanStack Query hooks (use-addresses, use-notifications)
- Fixed NewsletterSection (was faking success — now calls real API)
- Fixed lazy import anti-pattern in cart store
- Removed dead `as` prop from RevealOnScroll
- Replaced `React.forwardRef` with React 19 ref-as-prop on Button

### Phase 6 — TypeScript Hardening
- Eliminated all `as unknown as` casts (replaced with `parseJournalBody`, typed serialize)
- Eliminated all `as Record<string, string>` casts (replaced with `parseAddress`)
- Added optional Zod schema parameter to `apiFetch` for runtime response validation
- Changed `CategorySlug`/`CollectionSlug` from literal unions to `string` (admin-editable)
- Removed duplicate `ProductFilters` type definition
- Derived `ProductCardProduct` from `ProductListItem` (single source of truth)
- Exported pure functions from cloudinary.ts + currency.ts
- Added `parseBadgeKind()` runtime validator (replaces `as BadgeKind` cast)

### Phase 7 — Performance
- Replaced `import * as LucideIcons` with static 15-icon map (~150-300 KB saved)
- Migrated ProductCard + ProductGallery to `next/image` with responsive `sizes`
- Configured bundle analyzer (`bun run analyze`)
- Fixed `reduce-bandwidth.py` broken path
- Fixed 3 `eslint-disable exhaustive-deps` (inlined fetch logic into useEffect)
- Fixed `sameSite: strict → lax` (was causing login redirect loop)

### Phase 8 — Accessibility (WCAG 2.2 AA)
- Fixed all 7 jsx-a11y errors → 0 errors
- Added focus trap + Escape + aria-modal + aria-pressed to DisplayPreferences modal
- Added `htmlFor` + `id` on Footer newsletter label
- Added `role=link` + `tabIndex` + `onKeyDown` on ProductCard (keyboard accessible)
- Scoped HeroSlider arrow keys to focused section only
- Modernized skip-link (transform instead of left:-9999px)
- Added `aria-label="Primary navigation"` on desktop nav
- Added `aria-hidden` + sr-only text on decorative emoji

### Phase 9 — Styling Cleanup
- Consolidated duplicate `.aura-loader-ring` CSS definitions
- Replaced 6 hardcoded hex values with CSS tokens
- Fixed `BASEStyles` → `BASE_STYLES` naming
- Fixed admin analytics inline styles (replaced with classes where possible)
- Fixed `prose-aura` font consistency (`var(--font-display)` alias)

### Phase 10 — SEO Polish
- Replaced hardcoded BASE_URL with `getSiteUrl()` in 4 SEO files
- Added `aggregateRating` to `ProductJsonLd` (fetches review data from DB)
- Made canonical URLs absolute in cart page
- Added `images` field to sitemap for journal articles

### Phase 11 — Code Quality
- Deleted `plan.md` (dev planning doc)
- Auto-fixed import ordering across 262 files — 942 warnings → 0
- Removed 9 unused imports
- Fixed DisplayPreferences ref cleanup warning
- **First time ever: 0 ESLint errors + 0 ESLint warnings**

### Phase 12 — Testing Foundation
- Created `vitest.config.ts` with coverage thresholds
- Created 102 unit tests across 7 test files
- Covers: utils, security, escape-html, currency, cloudinary, order-status, auth

### Phase 13 — E2E Tests
- Created Playwright config with chromium + mobile-chrome
- Created 5 E2E test suites (auth, browse, checkout, admin, accessibility)
- Covers: login/logout, browse/cart, checkout flow, admin panel, WCAG checks

### Phase 14 — DevOps
- Created Pino structured logger (`src/lib/logger.ts`)
- Created Sentry config files (client, server, edge)
- Created Dependabot config (weekly npm + GitHub Actions updates)

### Phase 15 — Documentation
- Rewrote README with accurate tech stack, scripts, quality gates, testing
- Created `docs/architecture.md` (system design, data flow, key decisions)
- Created `docs/security.md` (auth, rate limiting, XSS/CSRF, incident response)
- Created `docs/contributing.md` (setup, rules, PR process, testing)
- Created `docs/deployment.md` (Vercel setup, env vars, cron, rollback, backup)

## [0.2.0] — Pre-audit baseline

- Original codebase as received from user
- Overall audit score: 5.8/10
- Multiple critical security vulnerabilities
- Zero tests, zero CI/CD, hardcoded credentials
