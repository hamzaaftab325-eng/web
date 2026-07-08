# Contributing — Aura Living

## Development Setup

```bash
git clone https://github.com/hamzaaftab325-eng/web.git
cd web
npm install
npx prisma generate
cp .env.example .env.local  # Fill in real credentials
npm run dev
```

## Code Quality Gates (ALL MUST PASS)

Before pushing, run:
```bash
npm run verify   # lint + tsc + inline-styles + console.log + any + ts-ignore
npm run test     # 102 unit tests
```

The pre-push hook (`husky`) runs `verify.sh` automatically. If it fails, the push is blocked.

## Rules

| Rule | Enforcement |
|------|-------------|
| Zero `console.log` | ESLint + verify.sh |
| Zero `any` types | ESLint + verify.sh |
| Zero `@ts-ignore` | ESLint + verify.sh |
| Zero inline `style={{}}` | ESLint + verify.sh (except global-error.tsx) |
| Zero TODO/FIXME | verify.sh |
| Zero ESLint warnings | ESLint (strict) |
| Zero TypeScript errors | tsc --noEmit |
| Zod on every API route | Code review |
| Soft delete only (isActive: false) | Code review |
| Transactions for multi-table mutations | Code review |

## Commit Convention

Format: `<type>: <description>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `deps`

Examples:
```
feat: add product image gallery with Embla carousel
fix: login redirect loop (sameSite strict → lax)
refactor: extract CheckoutOrderSummary from CheckoutFlow
docs: rewrite README with accurate tech stack
test: add 102 unit tests for pure helpers
deps: bump prisma from 6.19.2 to 6.19.3
```

## Pull Request Process

1. Create a branch: `git checkout -b feat/your-feature`
2. Make your changes (one concern per commit)
3. Run `npm run verify && npm run test`
4. Push and create a PR
5. Fill in the PR template (verification rubric required)
6. Wait for CI to pass (lint + tsc + build)
7. Get review from CODEOWNERS

## Testing

### Unit Tests
```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### E2E Tests
```bash
npx playwright install    # First time only
npm run test:e2e          # Run all E2E tests
```

## File Organization

- **Services** (`src/lib/services/`) — DB reads, DTO mapping
- **Validators** (`src/lib/validators/`) — Zod schemas
- **Components** (`src/components/aura/`) — UI components
- **Hooks** (`src/hooks/`) — Custom hooks + TanStack Query
- **Stores** (`src/store/`) — Zustand stores
- **Types** (`src/types/`) — Shared TypeScript types

## Adding a New API Route

1. Create `src/app/api/<path>/route.ts`
2. Import `requireUser` or `requireAdmin` from `@/lib/auth-guard`
3. Import Zod schema from `@/lib/validators/` (or create new one)
4. Import `apiBadRequest`, `apiServerError`, `safeError` from `@/lib/api-response`
5. Apply rate limiting from `@/lib/rate-limit` if public endpoint
6. Use service layer for DB operations (don't use `db` directly)
7. Return consistent response shape: `{ error, code }` or `{ data, message }`
8. Add test in `src/lib/__tests__/` or `e2e/`

## Adding a New Component

1. Create file in `src/components/aura/<category>/`
2. Use design tokens from `globals.css` (never hardcoded hex)
3. Check `useReducedMotion()` for animations
4. Ensure keyboard accessibility (tabIndex, onKeyDown, aria-label)
5. Use `cn()` from `@/lib/utils` for className merging
6. Keep under 300 lines — split if larger
