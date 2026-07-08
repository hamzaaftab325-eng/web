# Aura Living — Production-Grade E-Commerce

A premium home décor e-commerce platform built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma, and Upstash Redis.

## Live Site

**URL:** https://aura-living-1.vercel.app

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, webpack) |
| Language | TypeScript (strict mode, zero `any`, zero `@ts-ignore`) |
| Styling | Tailwind CSS 4 (CSS-first config) + design tokens |
| Animation | Framer Motion |
| State | Zustand (persisted) |
| Data Fetching | Server Components (SSR) + TanStack Query (client) |
| Database | PostgreSQL via Prisma 6 (Supabase) |
| Auth | JWT (jose for Edge, jsonwebtoken for Node) + httpOnly cookies |
| Rate Limiting | Upstash Redis (sliding window, atomic across serverless) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React (static imports, no wildcard) |
| Fonts | Playfair Display (display) + Inter (body) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Error Reporting | Sentry (optional, via SENTRY_DSN) |
| Logging | Pino (structured JSON in production) |
| CI/CD | GitHub Actions + Vercel |
| Security Headers | CSP, HSTS, X-Frame-Options DENY, Permissions-Policy |

## Getting Started

```bash
# Install dependencies
bun install   # or: npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your real credentials

# Generate Prisma client
bunx prisma generate   # or: npx prisma generate

# Run dev server
bun run dev   # or: npm run dev

# Production build
bun run build   # or: npm run build
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start dev server on port 3000 |
| `build` | Production build |
| `start` | Start production server |
| `lint` | ESLint (0 errors, 0 warnings) |
| `typecheck` | TypeScript check (0 errors) |
| `verify` | Full pre-push verification (lint + tsc + inline-styles + console.log + any + ts-ignore) |
| `test` | Run unit tests (102 tests) |
| `test:watch` | Run tests in watch mode |
| `test:coverage` | Run tests with coverage report |
| `test:e2e` | Run Playwright E2E tests |
| `analyze` | Bundle analyzer (ANALYZE=true next build) |
| `db:migrate` | Create + apply Prisma migration |
| `db:generate` | Regenerate Prisma client |
| `db:push` | Push schema to DB (emergencies only) |

## Code Quality Gates

This project enforces:

- **Zero ESLint errors + zero warnings** (including jsx-a11y accessibility rules)
- **Zero TypeScript errors** (strict mode, noImplicitAny, noImplicitOverride)
- **Zero `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`**
- **Zero `any` types** in client code
- **Zero `console.log`** in app code (use `logger` from `@/lib/logger`)
- **Zero inline styles** (except `global-error.tsx` and documented dynamic values)
- **Zero TODO/FIXME/HACK** comments
- **Pre-push hook** runs `verify.sh` automatically

## Testing

### Unit Tests (102 tests)

```bash
bun run test   # or: npx vitest run
```

Covers: utils, security, escape-html, currency, cloudinary, order-status, auth.

### E2E Tests (Playwright)

```bash
npx playwright install --with-deps chromium   # first time only
bun run test:e2e   # or: npx playwright test
```

Covers: auth flow, browse + cart, checkout, admin panel, accessibility.

## Documentation

- [Architecture](docs/architecture.md) — System design, data flow, key decisions
- [Security](docs/security.md) — Auth, rate limiting, XSS/CSRF prevention, incident response
- [Contributing](docs/contributing.md) — Setup, rules, PR process, testing
- [Deployment](docs/deployment.md) — Vercel setup, env vars, cron jobs, rollback

## Environment Variables

See `.env.example` for the full list. Critical ones:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase Postgres (with pgbouncer=true) |
| `DIRECT_URL` | Supabase Postgres direct connection (for migrations) |
| `JWT_SECRET` | JWT signing secret (use `openssl rand -base64 48`) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (required in production) |
| `CRON_SECRET` | Vercel cron auth secret |
| `SENTRY_DSN` | Sentry error reporting (optional) |

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Copy `DATABASE_URL` and `DIRECT_URL` from Supabase dashboard
3. Run migrations:
   ```bash
   bun run db:migrate   # or: npx prisma migrate dev
   ```

## License

Private — © Aura Living
