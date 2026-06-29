# Aura Living — Backend Execution Plan

**Stack:** Supabase (PostgreSQL) + Prisma + Custom JWT + COD + Cloudinary
**Status legend:** [ ] not started · [~] in progress · [x] complete

## Progress Tracking

| Phase | Description | Status |
|---|---|---|
| B0 | Remove mock data + refactor frontend to use API hooks | [x] |
| B1 | Supabase + Prisma + 30-table schema | [x] |
| B2 | Auth system (JWT) | [x] |
| B3 | Product API (CRUD) + refactor components | [x] |
| B4 | Content API (CMS) | [ ] |
| B5 | Orders + checkout (COD) | [ ] |
| B6 | Reviews + wishlist + addresses | [ ] |
| B7 | Cloudinary image upload | [ ] |
| B8 | Admin panel | [ ] |
| B9 | Analytics dashboard | [ ] |
| B10 | Final integration + polish | [ ] |

## Payment Roadmap: COD now → JazzCash + EasyPaisa + Bank Transfer later

## Completed:
- B0: 8 mock data files deleted, 38 components refactored to TanStack Query hooks
- B1: Prisma schema with 30 models, migration applied to Supabase, all tables created
- B2: bcrypt password hashing, JWT auth, 7 API routes, middleware, frontend login/signup wired
- B3: 7 product API routes, 2 catalog routes, all components use hooks
