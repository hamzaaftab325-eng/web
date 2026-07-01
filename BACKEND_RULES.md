# BACKEND_RULES.md — Absolute Constraints for Aura Living Backend

> These rules are NON-NEGOTIABLE. Violating any is a critical error.

## 1. ZERO Inline Styles — same as frontend.
## 2. Don't Go Outside the Design System — admin uses same tokens.
## 3. Zero `any` Types — all API request/response bodies typed.
## 4. Zero `console.log` — use `console.warn`/`console.error`.
## 5. Zero `@ts-ignore` without justification.
## 6. Every API Route Must Have: auth check, Zod validation, error handling, JSDoc.
## 7. Database: never raw SQL, never select *, always paginate, filter by is_active, transactions for multi-table.
## 8. Passwords: bcrypt hash (10 rounds), never return hash, never log.
## 9. JWT: access 15min httpOnly cookie, refresh 7day httpOnly+DB, secret in env.
## 10. Input Validation: Zod on every route, sanitize HTML, validate file uploads.
## 11. Error Response: { error: string, code: string, status: number }.
## 12. API Response: { data: T } or { data: T[], total, page, limit, totalPages }.
## 13. Env Vars: never commit secrets, never expose server vars to client.
## 14. Admin: middleware protected, double-check in handler, soft delete only, actions logged.
## 15. Files under 300 lines, named exports only.
## 16. Test after every phase. Commit after every phase.
