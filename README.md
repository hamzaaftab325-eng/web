# Aura Living — Production Frontend

A premium home décor e-commerce website built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Framer Motion.

## Live Site

**URL:** https://aura-living-1.vercel.app/

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, webpack) |
| Language | TypeScript (strict mode, `noImplicitAny`, `noImplicitOverride`) |
| Styling | Tailwind CSS 4 (CSS-first config) + design tokens |
| Animation | Framer Motion |
| State | Zustand (persisted) |
| Data Fetching | Server Components (SSR) + TanStack Query (client updates) |
| Database | PostgreSQL via Prisma 6 (Supabase) |
| Auth | JWT (jose for Edge, jsonwebtoken for Node) + httpOnly cookies |
| Rate Limiting | Supabase Postgres RPC (atomic, serverless-safe) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Fonts | Playfair Display (display) + Inter (body) |

## Getting Started

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Lint (0 errors, 0 warnings expected)
bun run lint

# Push Prisma schema to DB
bun run db:push

# Regenerate Prisma client
bun run db:generate
```

## Project Structure

```
src/
├── app/                    # Next.js App Router routes
│   ├── layout.tsx          # Root layout (fonts, metadata, AppChrome)
│   ├── page.tsx            # Home page (SSR)
│   ├── shop/               # /shop (SSR)
│   ├── about/              # /about
│   ├── journal/            # /journal + /[slug] (SSR)
│   ├── collections/        # /collections (SSR)
│   ├── care/               # /care
│   ├── sale/               # /sale (SSR)
│   ├── product/[slug]/     # Product detail (SSG)
│   ├── account/            # Account dashboard + sub-pages
│   ├── admin/              # Admin panel (admin-only)
│   ├── login/ signup/      # Auth pages
│   ├── forgot-password/ reset-password/
│   ├── api/                # API routes (60+ endpoints)
│   │   ├── auth/           # login, register, refresh, reset-password
│   │   ├── admin/          # admin CRUD for products, orders, content
│   │   ├── orders/         # customer order history + detail
│   │   ├── products/       # public product API
│   │   ├── reviews/        # public review API
│   │   ├── cron/           # daily-digest, low-stock-alerts, cleanup
│   │   └── track/          # page-view, product-view, cart-event
│   ├── error.tsx           # Global 500 error boundary
│   ├── admin/error.tsx     # Admin-specific error boundary
│   ├── admin/loading.tsx   # Admin loading skeleton
│   ├── loading.tsx         # Global loading skeleton
│   ├── not-found.tsx       # 404 page
│   ├── sitemap.ts          # Dynamic sitemap (excludes private pages)
│   ├── robots.ts           # Dynamic robots.txt (disallows /admin, /api, etc.)
│   └── manifest.ts         # PWA manifest
├── components/
│   ├── aura/               # Custom Aura components
│   │   ├── layout/         # Header, Footer, MobileNav, AppChrome, PageHero
│   │   ├── sections/       # Home page sections + page views
│   │   ├── commerce/       # ProductCard, CartDrawer, CheckoutFlow, etc.
│   │   ├── account/        # Account pages
│   │   ├── auth/           # Login, Signup, etc.
│   │   ├── ui/             # AuraInput, Button, Chip, EmptyState, etc.
│   │   └── animation/      # RevealOnScroll, TextBlurReveal
│   ├── analytics/          # AnalyticsProvider, CookieConsent, InstallPrompt
│   ├── seo/                # JSON-LD structured data components
│   └── ui/                 # shadcn/ui primitives (toast, toaster, chart only)
├── store/                  # Zustand stores (cart, wishlist, auth, theme, UI)
├── hooks/                  # Custom hooks (recently-viewed, focus-trap, etc.)
├── lib/
│   ├── services/           # Service layer (5 files: hero, product, category, collection, content)
│   ├── api/                # API client + endpoint wrappers
│   ├── auth-guard.ts       # requireUser / requireAdmin (DB-backed)
│   ├── auth-cookies.ts     # httpOnly cookie helpers
│   ├── rate-limit.ts       # Supabase RPC rate limiting
│   ├── cloudinary.ts       # Image upload + deletion
│   ├── email.ts            # Resend email sending
│   └── db.ts               # Prisma client singleton
├── types/                  # TypeScript type definitions
└── app/globals.css         # Design system tokens + global styles

prisma/
└── schema.prisma           # 25+ models (Product, Order, User, UsedResetToken, RateLimitCounter, etc.)

supabase/
└── migrations/
    └── 001_rate_limit_function.sql  # increment_rate_limit RPC function
```

## Key Features

- **Real Next.js App Router** — 18 route pages + SSG product pages
- **SSR Data Fetching** — home, shop, sale, collections, journal all fetch server-side (no spinners on initial load)
- **PKR Currency** — all prices in Pakistani Rupee (₨)
- **Cash on Delivery** — only payment method (no online payment gateway)
- **JWT Auth** — access (15min) + refresh (7day) tokens in httpOnly cookies
- **Rate Limiting** — Supabase Postgres RPC, atomic across serverless instances
- **Password Reset** — single-use JWT tokens with replay protection (UsedResetToken table)
- **Wishlist Sync** — wishlist persists to DB for logged-in users, hydrates on login
- **Admin Panel** — full CRUD for products, orders, content, customers
- **Admin Self-Lock Protection** — admins can't demote/deactivate themselves or the last admin
- **Transaction Safety** — all multi-table mutations wrapped in `db.$transaction`
- **Dark Mode** — theme toggle with no-flash inline script
- **Accessibility** — skip-to-content link, keyboard shortcuts, focus traps, ARIA, screen reader support
- **PWA** — installable with offline manifest
- **SEO** — per-page metadata, JSON-LD structured data (Organization, WebSite, FAQPage, BlogPosting, BreadcrumbList, CollectionPage), sitemap, robots.txt
- **Analytics** — GA4 + Meta Pixel (consent-gated)
- **Mobile UX** — bottom tab bar, swipe-to-close drawers, sticky add-to-cart
- **Nightly Crons** — daily order digest, low-stock alerts, expired token cleanup

## Design System

- **Canvas:** #FAF7F0 (warm cream)
- **Gold:** #D4AF37 (accent)
- **Ink:** #1A1714 (text)
- **Font:** Playfair Display (headings) + Inter (body)
- All tokens in `src/app/globals.css` as CSS custom properties
- Dark mode tokens via `[data-theme="dark"]` selector

## Environment Variables

See `.env.example` for the full list. Critical ones:

```env
# Database (Supabase Postgres)
DATABASE_URL="postgresql://...supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...supabase.co:5432/postgres"

# Supabase (for rate limiting via PostgREST RPC)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..." (server-side only, bypasses RLS)

# Auth
JWT_SECRET=generate-with-openssl-rand-base64-48
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary (image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM="Aura Living <noreply@auraliving.com>"

# Cron auth
CRON_SECRET=generate-with-openssl-rand-base64-32

# Site URL
NEXT_PUBLIC_SITE_URL=https://aura-living-1.vercel.app
```

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration in `supabase/migrations/001_rate_limit_function.sql` via Supabase SQL Editor
3. Push the Prisma schema:
   ```bash
   bun run db:push
   ```
4. Set `DATABASE_URL` and `DIRECT_URL` in `.env` and on Vercel

## Conventions

- **Zero inline styles** — enforced by ESLint (`react/forbid-component-props`)
- **Zero `any` types** — `noImplicitAny: true` in tsconfig
- **Zero `console.log`** — use `console.warn` / `console.error` (enforced by ESLint)
- **Zero `@ts-ignore`** — fix the type, don't suppress
- **Zero ESLint warnings** — 0 errors, 0 warnings expected
- **All hover states use `c-gold-deep`**
- **All cards use `bg-gradient-card-warm` with `border-hairline-cream`**
- **Zod validation on every API route**
- **Service layer returns DTOs, not raw Prisma models**
- **Multi-table mutations wrapped in `db.$transaction`**
- **Soft delete only** — never hard-delete data (set `isActive: false`)
- **Commit after every phase** — prevents sandbox rollback

## Code Quality Gates

Before committing, verify:

```bash
# 1. Build passes
bun run build

# 2. Lint passes (0 errors, 0 warnings)
bun run lint

# 3. Prisma client is up to date
bun run db:generate
```
