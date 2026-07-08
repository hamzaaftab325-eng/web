# Architecture — Aura Living

## Overview

Aura Living is a Next.js 16 App Router e-commerce application with a layered architecture:

```
┌─────────────────────────────────────────┐
│           Next.js App Router            │  ← Routes, SSR, ISR, Metadata
├─────────────────────────────────────────┤
│         API Route Handlers (97)         │  ← Input validation (Zod), auth, rate limiting
├─────────────────────────────────────────┤
│           Service Layer (7)             │  ← Business logic, DTO mapping, transactions
├─────────────────────────────────────────┤
│            Prisma Client (1)            │  ← DB singleton (connection_limit=1)
├─────────────────────────────────────────┤
│          PostgreSQL (Supabase)          │  ← 30+ models, indexes, constraints
└─────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Service Layer Pattern
All DB reads go through service files (`src/lib/services/`). Services return DTOs (Data Transfer Objects), never raw Prisma models. This ensures:
- Consistent field names across consumers
- Decimal → number conversion
- Only needed fields selected (no over-fetching)
- Single point of change for schema changes

### 2. DTO Pattern
The `toListItem()` function in `product.service.ts` is the canonical product DTO mapper. It's exported and reused by all consumers (previously duplicated in 4 places).

### 3. Auth: Dual JWT Strategy
- `src/lib/auth.ts` — uses `jsonwebtoken` (Node.js runtime)
- `src/lib/auth-jwt.ts` — uses `jose` (Edge runtime)
- Both sign/verify with the same secret + HS256 algorithm
- Edge middleware imports from `auth-jwt.ts`, API routes import from `auth.ts`

### 4. Cookie Strategy
- `aura_access` — httpOnly, secure, sameSite=lax, 15min TTL
- `aura_refresh` — httpOnly, secure, sameSite=lax, 7d/30d TTL
- `sameSite=lax` (not strict) — allows cookies on top-level navigations (fixes redirect loop)

### 5. Rate Limiting
- Upstash Redis with sliding window algorithm
- One Ratelimit instance per (limit, window) tuple — cached to avoid re-instantiation
- Graceful degradation: if env vars missing, rate limiting is disabled with a warning

### 6. Validation Boundary
- Zod schemas in `src/lib/validators/` — shared between API routes and (future) client forms
- `apiFetch<T>` accepts optional Zod schema for runtime response validation
- `parseJournalBody()` validates JSON columns at the service boundary

### 7. Error Handling
- `src/lib/api-response.ts` — consistent response helpers (`apiBadRequest`, `apiNotFound`, etc.)
- `safeError()` — sanitizes caught errors (detects Prisma P-codes, returns safe messages)
- 3 error boundaries: root (`error.tsx`), global (`global-error.tsx`), admin (`admin/error.tsx`)
- 3 segment boundaries: shop, account, journal

### 8. Testing Strategy
- **Unit tests (102):** Pure functions — utils, security, escape-html, currency, cloudinary, order-status, auth
- **E2E tests (5 suites):** Playwright — auth, browse, checkout, admin, accessibility
- **Pre-push hook:** `verify.sh` runs lint + tsc + inline-styles + console.log + any + ts-ignore checks

## Data Flow

### Product page (SSR + ISR):
```
User → /product/[slug] → generateMetadata() → DB (product + images)
                       → ProductPage() → DB (product + variants + reviews)
                       → ProductJsonLd (with aggregateRating)
                       → revalidate: 3600 (1 hour ISR)
```

### Login flow:
```
LoginView → POST /api/auth/login → verifyPassword → signAccessToken + signRefreshToken
          → setAuthCookies (httpOnly, sameSite=lax)
          → setUser (Zustand store)
          → router.push("/admin")
          → AdminLayout → useAuthStore.getState().user (no API call needed)
```

### API request with auto-refresh:
```
apiFetch → fetch("/api/something") → 401
         → refreshAccessToken() (mutex — concurrent 401s share one refresh)
         → POST /api/auth/refresh → new cookies set
         → retry original request (ONCE, with _skipRefresh=true)
         → if still 401 → redirect to /login?redirect=currentPath
```
