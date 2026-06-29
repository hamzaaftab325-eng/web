import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma client singleton — tuned for Vercel serverless.
 *
 * Why `datasourceUrl` with `connection_limit=1`:
 * Vercel serverless functions spin up many short-lived instances. Each Prisma
 * client opens its own connection pool, which can exhaust Supabase's
 * connection limit. Limiting each instance to 1 connection prevents that.
 * Reference: https://www.prisma.io/docs/guides/performance-and-optimization/optimizing-prisma-in-serverless-environments
 *
 * On Vercel Hobby, functions run in `iad1` (US East) by default. We pin
 * `sfo1` (US West, San Francisco) via vercel.json to be ~80ms closer to
 * Supabase's `ap-northeast-2` (Seoul) region.
 */
const isProd = process.env.NODE_ENV === 'production'

function buildDatasourceUrl(): string | undefined {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) return undefined
  // Prisma supports `connection_limit` as a query param. If the URL already
  // has query params (e.g. `?pgbouncer=true`), append to them.
  const sep = baseUrl.includes('?') ? '&' : '?'
  if (baseUrl.includes('connection_limit=')) return baseUrl
  return `${baseUrl}${sep}connection_limit=1`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error', 'warn'] : ['query', 'error', 'warn'],
    datasourceUrl: buildDatasourceUrl(),
  })

if (!isProd) globalForPrisma.prisma = db