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
| B4 | Content API (CMS) | [x] |
| B5 | Orders + checkout (COD) | [x] |
| B6 | Reviews + wishlist + addresses | [x] |
| B7 | Cloudinary image upload | [ ] |
| B8 | Admin panel | [ ] |
| B9 | Analytics dashboard | [ ] |
| B10 | Final integration + polish | [ ] |

## Payment Roadmap: COD now → JazzCash + EasyPaisa + Bank Transfer later

## Completed API Routes (20+):
- Auth: register, login, logout, me (GET+PUT), forgot-password, reset-password
- Products: list, detail, featured, search, materials
- Catalog: categories, collections
- Content: hero-slides, faq, testimonials, artisans, care-guides, journal, press, brand-values, instagram, first-order-offer, exit-intent, promo-codes, shipping-methods
- Orders: list, create, detail
- Reviews: list by product, submit, mark helpful
- User: addresses (CRUD), wishlist (GET/POST/DELETE)
