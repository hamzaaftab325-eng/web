# Security — Aura Living

## Authentication

- **JWT-based** with access (15min) + refresh (7d/30d with remember me) tokens
- **httpOnly cookies** — JavaScript cannot access auth tokens
- **sameSite=lax** — allows top-level navigation, blocks cross-site POST
- **Refresh token rotation** — each refresh issues a new token, old session deleted
- **Reuse detection** — if a used refresh token is presented again, ALL sessions revoked
- **DB-backed role check** — `requireUser()` fetches current role from DB (not JWT-baked)
- **60s in-memory cache** — prevents DB round-trip on every authed request

## Authorization

- `requireUser()` — access token only, DB-backed isActive check
- `requireAdmin()` — requireUser + role === "admin"
- **Admin self-lock protection** — admins can't demote/deactivate themselves or the last admin
- **Middleware** — blocks unauthenticated access to /admin, /account, /api/user/*, /api/admin/*
- **IDOR prevention** — review helpful endpoint verifies reviewId.productId === productSlug

## Rate Limiting

| Endpoint | Limit | Window | Key |
|----------|------:|--------|-----|
| /api/auth/login | 5 | 15 min | IP |
| /api/auth/register | 3 | 1 hour | IP |
| /api/auth/forgot-password | 3 | 1 hour | email |
| /api/auth/reset-password | 5 | 1 min | IP |
| /api/contact | 5 | 1 hour | IP |
| /api/subscribe | 3 | 1 hour | IP |
| /api/reviews POST | 3 | 1 hour | IP |
| /api/reviews/*/helpful | 1 | 10 sec | userId |
| /api/products/*/questions POST | 5 | 1 hour | IP |
| /api/unsubscribe | 3 | 1 hour | IP |

Backend: Upstash Redis sliding window (atomic across serverless instances).

## XSS Prevention

- `escapeHtml()` applied to every customer-controlled interpolation in HTML responses (invoice route)
- `sanitizeHtml()` strips tags from all user-submitted text (reviews, contact, addresses)
- `sanitizeObject()` recursively sanitizes nested objects
- Zod validation on every API route rejects unexpected fields
- CSP header restricts script sources

## CSRF Defense

- `sameSite=lax` cookies — browser refuses to send cookies on cross-site POST
- No GET mutations (except legacy unsubscribe — rate-limited)
- All state-changing operations via POST/PUT/DELETE

## SQL Injection

- Zero raw queries — all via Prisma query builder
- One safe `$queryRaw\`SELECT 1\`` in health check (parameterized tagged template)

## Secrets Management

- All secrets via environment variables
- Zero hardcoded credentials in source code
- `.env*` gitignored (except `.env.example` with placeholder values)
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only (no `NEXT_PUBLIC_` prefix)
- Pre-push hook checks for `@ts-ignore`, `any`, `console.log`, inline styles

## Incident Response

1. **Rotate compromised credentials immediately:**
   - Supabase: Dashboard → Project Settings → Database → Reset password
   - Cloudinary: Console → Settings → API Keys → Regenerate
   - JWT_SECRET: Generate new with `openssl rand -base64 48`, update in Vercel
2. **Revoke all sessions:** `DELETE FROM "UserSession" WHERE "userId" = '<user-id>';`
3. **Check Sentry** for error spikes during the incident window
4. **Review Vercel logs** for suspicious API calls
5. **Notify affected users** if PII was exposed

## Security Headers

| Header | Value |
|--------|-------|
| Content-Security-Policy | script-src 'self' 'unsafe-inline' (Next.js requires) + analytics domains |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |
