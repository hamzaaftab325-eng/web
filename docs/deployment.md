# Deployment — Aura Living

## Vercel Deployment

The project auto-deploys to Vercel on push to `main`.

### Environment Variables

Set these in Vercel → Settings → Environment Variables:

**Required:**
| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | (output of `openssl rand -base64 48`) |
| `NEXT_PUBLIC_SITE_URL` | `https://aura-living-1.vercel.app` |
| `CRON_SECRET` | (output of `openssl rand -base64 32`) |
| `UPSTASH_REDIS_REST_URL` | `https://creative-buffalo-158135.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | (from Upstash dashboard) |

**Optional:**
| Variable | Purpose |
|----------|---------|
| `SENTRY_DSN` | Error reporting |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (for service-role API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Image uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RESEND_API_KEY` | Transactional emails |
| `EMAIL_FROM` | Sender email address |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta/Facebook Pixel |

### Cron Jobs

Configured in `vercel.json`:
- **Daily order digest:** 04:00 UTC (09:00 PKT)
- **Low-stock alerts:** 05:00 UTC (10:00 PKT)
- **Token cleanup:** 23:30 UTC (04:30 PKT next day)

Each cron route is protected by `CRON_SECRET` via `Authorization: Bearer` header.

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. `bun install --frozen-lockfile`
2. `bunx prisma generate`
3. `bun run lint` (0 errors, 0 warnings)
4. `bunx tsc --noEmit` (0 errors)
5. `bun run build` (must succeed)

Test and E2E jobs are configured but require a test database to activate.

### Pre-push Hook

Husky runs `scripts/verify.sh` before every push:
1. Inline styles check (0 in app code)
2. Console.log check (0 in app code)
3. TODO/FIXME/HACK check (0)
4. `any` types check (0 in client code)
5. `@ts-ignore` check (0)
6. ESLint (0 errors)
7. TypeScript (0 errors)

Bypass with `git push --no-verify` (not recommended).

## Rollback

Vercel keeps previous deployments. To rollback:
1. Go to Vercel → Deployments
2. Find the last known-good deployment
3. Click "..." → "Promote to Production"

## Database Migrations

```bash
# Create a new migration (development)
npm run db:migrate

# Apply migrations (production — run locally with prod DATABASE_URL)
npx prisma migrate deploy

# Reset database (DESTRUCTIVE — development only)
npm run db:reset
```

Never use `db:push` in production — always use `migrate deploy`.

## Backup Strategy

- **Supabase Free Tier:** Daily automated snapshots (7-day retention)
- **Supabase Pro Tier:** Point-in-time recovery (PITR) — recommended for production
- **Manual backup:** `pg_dump $DIRECT_URL > backup.sql`
