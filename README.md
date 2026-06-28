# Aura Living — Production Frontend

A premium home décor e-commerce website built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Framer Motion.

## Live Site

**URL:** https://aura-living-1.vercel.app/

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Animation | Framer Motion |
| State | Zustand (persisted) |
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

# Lint
bun run lint

# Verify (pre-commit checks)
bash scripts/verify.sh
```

## Project Structure

```
src/
├── app/                    # Next.js App Router routes
│   ├── layout.tsx          # Root layout (fonts, metadata, AppChrome)
│   ├── page.tsx            # Home page
│   ├── shop/               # /shop
│   ├── about/              # /about
│   ├── journal/            # /journal
│   ├── collections/        # /collections
│   ├── artisans/           # /artisans
│   ├── sustainability/     # /sustainability
│   ├── care/               # /care
│   ├── product/[slug]/     # Product detail (SSG, 24 pages)
│   ├── account/            # Account dashboard + sub-pages
│   ├── login/              # Auth pages
│   ├── signup/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── error.tsx           # 500 error boundary
│   ├── not-found.tsx       # 404 page
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── robots.ts           # Dynamic robots.txt
│   └── manifest.ts         # PWA manifest
├── components/
│   ├── aura/               # Custom Aura components
│   │   ├── layout/         # Header, Footer, MobileNav, AppChrome, PageHero
│   │   ├── sections/       # Home page sections + page views
│   │   ├── commerce/       # ProductCard, CartDrawer, CheckoutFlow, etc.
│   │   ├── account/        # Account pages
│   │   ├── auth/           # Login, Signup, etc.
│   │   ├── marketing/      # ExitIntentPopup, FirstOrderBanner
│   │   ├── ui/             # AuraInput, Button, Chip, EmptyState, etc.
│   │   └── animation/      # RevealOnScroll, TextBlurReveal
│   ├── analytics/          # AnalyticsProvider, CookieConsent, InstallPrompt
│   ├── seo/                # JSON-LD structured data components
│   └── ui/                 # shadcn/ui primitives
├── store/                  # Zustand stores (cart, wishlist, auth, theme, UI)
├── hooks/                  # Custom hooks (recently-viewed, keyboard, etc.)
├── lib/                    # Utils, analytics, view-url, swipe-to-close
├── data/                   # Mock data (products, categories, collections, etc.)
├── types/                  # TypeScript type definitions
└── app/globals.css         # Design system tokens + global styles
```

## Key Features

- **Real Next.js App Router** — 18 route pages + 24 SSG product pages
- **PKR Currency** — all prices in Pakistani Rupee (₨)
- **Dark Mode** — theme toggle with no-flash inline script
- **Accessibility** — keyboard shortcuts, focus-visible, ARIA, screen reader support
- **PWA** — installable with offline manifest
- **SEO** — per-page metadata, JSON-LD structured data, sitemap, robots.txt
- **Analytics** — GA4 + Meta Pixel (consent-gated)
- **Mobile UX** — bottom tab bar, swipe-to-close drawers, sticky add-to-cart

## Design System

- **Canvas:** #FAF7F0 (warm cream)
- **Gold:** #D4AF37 (accent)
- **Ink:** #1A1714 (text)
- **Font:** Playfair Display (headings) + Inter (body)
- All tokens in `src/app/globals.css` as CSS custom properties

## Swapping Mock Data for Real Backend

1. Update `src/lib/api/client.ts` — change `BASE_URL` from `""` to your API URL
2. All API functions in `src/lib/api/` will automatically use the real backend
3. Mock data in `src/data/` can be removed once API is connected

## Environment Variables

```env
# Analytics (optional — site works without these)
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
```

## Conventions

- **Zero inline styles** — enforced by ESLint
- **Zero `any` types** — use `unknown` and narrow
- **Zero `console.log`** — use `console.warn` / `console.error`
- **Zero `@ts-ignore`** — fix the type, don't suppress
- **All hover states use `c-gold-deep`**
- **All cards use `bg-gradient-card-warm` with `border-hairline-cream`**
- **Commit after every phase** — prevents sandbox rollback
