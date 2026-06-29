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
| B7 | Cloudinary image upload | [x] |
| B8 | Admin panel | [x] |
| B9 | Analytics dashboard | [x] |
| B10 | Final integration + polish | [x] |

## Payment Roadmap: COD now → JazzCash + EasyPaisa + Bank Transfer later

## Total API Routes Built: 30+
- Auth: register, login, logout, me (GET+PUT), forgot-password, reset-password
- Products: list, detail, featured, search, materials
- Catalog: categories, collections
- Content: hero-slides, faq, testimonials, artisans (+[slug]), care-guides (+[slug]), journal (+[slug]), press, brand-values, instagram, first-order-offer, exit-intent, promo-codes/[code], shipping-methods
- Orders: list, create, detail
- Reviews: list by product, submit, mark helpful
- User: addresses (CRUD), wishlist (GET/POST/DELETE)
- Admin: analytics overview, analytics chart data, orders list, order detail (GET+PUT), products list (GET+POST), product detail (GET+PUT+DELETE)
- Upload: /api/upload (admin-only Cloudinary image upload)
- Health: /api/health (liveness + readiness probe)

## Admin Panel Pages:
- /admin — Dashboard (revenue, orders, products, customers, recent orders, low stock)
- /admin/products — Product list with search
- /admin/products/new — Create new product form (with Cloudinary image upload)
- /admin/products/[id]/edit — Edit product form (with soft-delete)
- /admin/orders — Order list with status filter
- /admin/orders/[id] — Order detail with status update
- /admin/analytics — Sales charts, top products, search terms
- /admin/content — Content management hub
- /admin/settings — Store configuration
