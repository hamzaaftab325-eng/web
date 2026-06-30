# Aura Living — Missing Functionalities Plan

> **Status legend:** `[ ]` not started · `[~]` in progress · `[x]` complete
> 
> **Last updated:** 2026-06-30
> **Current backend completion:** ~92%
> **Target:** 100% fully working e-commerce platform

---

## Phase 11 — Content Management Completion
> Missing admin editors for content models that have APIs but no admin UI

### 11.1 First Order Offer Editor
- [x] Create `/api/admin/content/first-order-offer/route.ts` (GET + PUT)
- [x] Create `/admin/content/first-order-offer/page.tsx` — edit form (isActive, discountPercent, promoCode, popupTitle, popupDescription, bannerText, dismissDurationDays, showDelayMs)
- [x] Add to admin nav under "Content" section

### 11.2 Exit Intent Popup Editor
- [x] Create `/api/admin/content/exit-intent/route.ts` (GET + PUT)
- [x] Create `/admin/content/exit-intent/page.tsx` — edit form (isActive, title, description, discountPercent, promoCode, imageUrl, triggerDelaySeconds)
- [x] Fix `ExitIntentPopup.tsx` component to fetch from API (currently hardcoded)
- [x] Add to admin nav under "Content" section

### 11.3 Brand Values Editor
- [x] Create `/api/admin/content/brand-values/route.ts` (GET + POST)
- [x] Create `/api/admin/content/brand-values/[id]/route.ts` (PUT + DELETE)
- [x] Create `/admin/content/brand-values/page.tsx` — CRUD list

### 11.4 Press Features Editor
- [x] Create `/api/admin/content/press/route.ts` (GET + POST)
- [x] Create `/api/admin/content/press/[id]/route.ts` (PUT + DELETE)
- [x] Create `/admin/content/press/page.tsx` — CRUD list

### 11.5 Instagram Posts Editor
- [x] Create `/api/admin/content/instagram/route.ts` (GET + POST)
- [x] Create `/api/admin/content/instagram/[id]/route.ts` (PUT + DELETE)
- [x] Create `/admin/content/instagram/page.tsx` — CRUD list

### 11.6 Brand Marquee Items Editor
- [x] Create `/api/admin/content/brand-marquee/route.ts` (GET + POST)
- [x] Create `/api/admin/content/brand-marquee/[id]/route.ts` (PUT + DELETE)
- [x] Create `/admin/content/brand-marquee/page.tsx` — CRUD list

### 11.7 Sustainability Content Editor
- [x] Create `/api/admin/content/sustainability/route.ts` (GET + PUT)
- [x] Create `/admin/content/sustainability/page.tsx` — edit form

### 11.8 Flash Sale Management
- [x] Create `/api/admin/flash-sales/route.ts` (GET + POST)
- [x] Create `/api/admin/flash-sales/[id]/route.ts` (PUT + DELETE)
- [x] Create `/admin/flash-sales/page.tsx` — CRUD with date windows
- [x] Create `/api/content/flash-sales/route.ts` — public active flash sale
- [x] Add flash sale banner to storefront

### 11.9 Update Content Hub Page
- [x] Update `/admin/content/page.tsx` — add links to all new content editors
- [x] Remove "Full visual editors coming soon" notice

---

## Phase 12 — Product System Enhancement
> Product variants, collections assignment, pagination, bulk actions

### 12.1 Product Variants UI
- [x] Add "Variants" section to product create form (`/admin/products/new`)
- [x] Add "Variants" section to product edit form (`/admin/products/[id]/edit`)
- [x] Each variant: label, swatchColor, stockQuantity, sortOrder
- [x] Update `/api/admin/products` POST to accept variants array
- [x] Update `/api/admin/products/[id]` PUT to manage variants
- [x] Update product detail page to show variant selector (already exists)
- [x] Update cart store to handle variant selection (already exists)

### 12.2 Product Collection Assignment
- [x] Add "Collections" multi-select to product create/edit forms
- [x] Update `/api/admin/products` POST to accept collectionIds
- [x] Update `/api/admin/products/[id]` PUT to manage collection assignments
- [x] Show variant count badge in product list

### 12.3 Product Pagination
- [x] Add pagination to `/admin/products` page (20 per page with prev/next)
- [x] Add page controls (prev/next, page indicator)
- [x] Show total count in header

### 12.4 Product Bulk Actions
- [x] Add checkbox selection to product list
- [x] Add bulk actions bar: Activate, Deactivate, Feature, Unfeature, Delete
- [x] Add bulk category assignment (dropdown in bulk actions bar)

### 12.5 Product Search & Filter
- [x] Add category filter dropdown to product list
- [x] Add price range filter (min/max price inputs)
- [x] Add stock status filter (in stock / out of stock / low stock)
- [x] Add sort options (newest, price asc/desc, name)

### 12.6 Related Products
- [x] Related products auto-fetched by category (no manual field needed)
- [x] Create API endpoint /api/products/[slug]/related
- [x] Show related products on product detail page (already exists)

### 12.7 Product Import/Export
- [x] Create `/api/admin/products/export` — CSV export of all products
- [x] Create /api/admin/products/import — CSV import

---

## Phase 13 — Order System Enhancement
> Order search, pagination, invoices, status workflow

### 13.1 Order Search
- [x] Add search by order number to `/admin/orders` page
- [x] Add search by customer email
- [x] Add date range filter (from/to date pickers)

### 13.2 Order Pagination
- [x] Add pagination to `/admin/orders` page (20 per page)
- [x] Add page controls (prev/next, page indicator)

### 13.3 Order Invoice PDF
- [x] Create `/api/admin/orders/[id]/invoice` — printable HTML invoice
- [x] Add "Invoice" button to order detail page
- [x] Auto-triggers window.print() on load

### 13.4 Order Status Workflow
- [x] Add visual status timeline to order detail (processing → packed → shipped → delivered)
- [x] Show createdAt + updatedAt timestamps
- [x] Display order notes if present

### 13.5 Order Refund/Cancellation
- [x] Add payment status buttons (pending / paid / refunded)
- [x] Add "Cancel Order" button with confirmation dialog
- [x] Restock items on cancellation (auto-increment stock)

### 13.6 Customer Order History in Admin
- [x] Add "View Customer Profile" link from order detail → customer detail
- [x] Customer info shown with avatar, name, email, and link to profile

---

## Phase 14 — Marketing & Email System
> Email sending, abandoned cart, newsletters

### 14.1 Email Service Setup
- [x] Choose email provider (Resend)
- [x] Create `src/lib/email.ts` — email sending helper
- [x] Add email environment variables (RESEND_API_KEY, EMAIL_FROM)
- [x] Create email template system (7 branded HTML templates)

### 14.2 Transactional Emails
- [x] Order confirmation email (sent on order creation)
- [x] Order status update email (sent on status change)
- [x] Shipping notification email (with tracking number)
- [x] Welcome email (sent on signup)
- [ ] Password reset email (template ready, needs forgot-password wiring)
- [x] Review approved email (sent when admin approves review)

### 14.3 Newsletter System
- [x] Create `/api/admin/newsletter` — send newsletter to all subscribers
- [x] Create `/admin/newsletter/page.tsx` — compose and send newsletter
- [x] Add unsubscribe link to emails
- [ ] Track email opens and clicks (deferred — needs Resend webhooks)

### 14.4 Abandoned Cart Recovery
- [ ] Track cart abandonment (deferred — needs cron job)
- [ ] Send abandoned cart email (template ready, needs cron job)
- [ ] Create `/admin/abandoned-carts/page.tsx` (deferred)
- [ ] Auto-send abandoned cart reminders (deferred — needs cron job)

### 14.5 Email Subscriber Management
- [x] CSV export already exists on subscribers page
- [ ] Add subscriber segmentation (deferred)
- [ ] Add subscriber import (deferred)

---

## Phase 15 — Analytics & Insights
> Enhanced analytics, page views, search analytics

### 15.1 Page View Tracking
- [x] Create `/api/track/page-view` endpoint
- [x] Add tracking via usePageViewTracking() hook in AppChrome
- [x] Analytics API supports detail=pages (top 20 paths)
- [x] Show top pages + total views in analytics API

### 15.2 Product View Tracking
- [x] Create `/api/track/product-view` endpoint
- [x] Add tracking to /product/[slug] page (server-side)
- [x] Show mostViewedProducts (top 10) in analytics overview
- [ ] Show view-to-purchase conversion rate (deferred)

### 15.3 Search Analytics
- [x] Verified — search logging works (writes to SearchLog)
- [x] Analytics API supports detail=search (top, recent, zero-results)
- [x] Show top searches, zero-results, recent searches
- [ ] Add suggested products for zero-results (deferred)

### 15.4 Cart Analytics
- [x] Track cart events (add_to_cart, remove_from_cart, begin_checkout, purchase)
- [x] Analytics API supports detail=carts (funnel + conversion + abandonment)
- [x] Show conversion rate, abandonment rate, funnel counts

### 15.5 Revenue Analytics
- [x] Analytics API supports detail=revenue (by category)
- [ ] Add revenue by collection (deferred)
- [ ] Add day-of-week heatmap (deferred)
- [ ] Add customer LTV (deferred)
- [ ] Add repeat purchase rate (deferred)

### 15.6 Export Analytics
- [x] CSV export already exists for subscribers; analytics export deferred
- [ ] Export sales data, top products, customer list, search terms

---

## Phase 16 — Payment Gateway Integration
> JazzCash, EasyPaisa, Bank Transfer

### 16.1 JazzCash Integration
- [ ] Sign up for JazzCash merchant account
- [ ] Add JazzCash credentials to environment variables
- [ ] Create `/api/payments/jazzcash/initiate` — initiate payment
- [ ] Create `/api/payments/jazzcash/callback` — payment callback handler
- [ ] Add JazzCash option to checkout payment step
- [ ] Test end-to-end with sandbox account

### 16.2 EasyPaisa Integration
- [ ] Sign up for EasyPaisa merchant account
- [ ] Add EasyPaisa credentials to environment variables
- [ ] Create `/api/payments/easypaisa/initiate` — initiate payment
- [ ] Create `/api/payments/easypaisa/callback` — payment callback handler
- [ ] Add EasyPaisa option to checkout payment step
- [ ] Test end-to-end with sandbox account

### 16.3 Bank Transfer Integration
- [ ] Add bank account details to admin settings
- [ ] Create `/api/payments/bank-transfer/instructions` — return bank details
- [ ] Add Bank Transfer option to checkout
- [ ] Add manual payment confirmation in admin (upload receipt)
- [ ] Add order status "awaiting payment confirmation"

### 16.4 Payment Management
- [ ] Update checkout flow to support multiple payment methods
- [ ] Update order model to store payment details (transaction ID, payment gateway)
- [ ] Add payment status tracking (pending, paid, failed, refunded)
- [ ] Add refund processing for online payments

---

## Phase 17 — Customer Experience
> Wishlist sharing, comparison, recently viewed, reviews

### 17.1 Wishlist Sharing
- [x] Create `/api/user/wishlist/share` — generate shareable link
- [x] Create `/wishlist/[shareId]` — public wishlist view
- [x] Add 'Share Wishlist' button (already existed, now uses API)
- [x] Add 'Copy Link' (copies to clipboard with toast)

### 17.2 Product Comparison
- [x] Verified CompareTray works (Zustand store, 4 product limit)
- [x] Compare button exists on product cards
- [x] Comparison table exists in CompareTray
- [x] Remove button in CompareTray
- [x] 4 product limit enforced

### 17.3 Recently Viewed Products
- [x] Verified RecentlyViewed works (localStorage, 8 items)
- [x] Tracks via useRecentlyViewed hook (localStorage)
- [x] Shows on product detail page
- [x] Shows on home page

### 17.4 Review Enhancements
- [ ] Add photo upload to reviews (deferred — needs per-review file upload)
- [ ] Add review reply system (deferred)
- [x] Verified helpful voting works (POST /api/reviews/[productSlug]/helpful/[reviewId])
- [x] Review sorting exists (recent, highest, lowest, helpful)
- [x] Review filtering exists (rating, verified, photos chips)

### 17.5 Product Q&A
- [x] Created Question model in Prisma schema
- [x] Created /api/products/[slug]/questions (GET + POST)
- [x] Created /api/admin/questions (GET) + [id] (PUT + DELETE)
- [ ] Add Q&A section to product detail page (deferred — API ready)
- [ ] Add 'Ask a Question' button (deferred — API ready)

---

## Phase 18 — Admin Settings & Configuration
> Make settings page editable

### 18.1 Store Settings
- [x] Create `/api/admin/settings` (GET + PUT)
- [x] Created Setting model (key-value store)
- [x] Make settings page editable:
  - [x] Store name, contact email, phone, address
  - [x] Currency + symbol (PKR default)
  - [x] Tax rate (0% default, configurable)
  - [x] Free shipping threshold
  - [x] Default shipping cost
  - [x] Order number prefix
  - [x] Social media links (Instagram, Facebook, Twitter, Pinterest)

### 18.2 Payment Settings
- [x] Toggle payment methods on/off (COD, JazzCash, EasyPaisa, Bank Transfer)
- [ ] Configure payment gateway credentials (via env vars)
- [ ] Set minimum order per method (deferred)

### 18.3 Email Settings
- [x] Configure email provider (Resend) + from address
- [x] Set from email address
- [ ] Test email config (deferred — needs Resend API key)
- [x] Toggle email sending on/off (order confirmation, status updates, newsletter)

### 18.4 SEO Settings
- [x] Edit meta title + description (home, shop)
- [ ] Edit OG images (deferred)
- [ ] Edit robots.txt (deferred)
- [ ] Edit sitemap priorities (deferred)

### 18.5 Admin User Management
- [x] Admin users managed via /admin/customers (promote/demote)
- [ ] Invite admin via email (deferred)
- [x] Revoke admin access (demote to customer on customers page)
- [ ] View admin activity log (deferred)

---

## Phase 19 — Security & Performance
> Security hardening, performance optimization

### 19.1 Security
- [x] Add rate limiting to auth endpoints (login, register, forgot-password — 5/15min)
- [x] Add rate limiting to review submission (10/15min)
- [ ] Add CAPTCHA to login/signup forms (deferred — needs hCaptcha/Cloudflare Turnstile)
- [x] Add CSRF protection via SameSite cookies (already set: sameSite=strict)
- [x] Add input sanitization for all text fields (sanitizeHtml on register + reviews)
- [x] File upload validates MIME type + 10MB limit (magic number check deferred)
- [ ] Add session timeout (deferred — JWT access token expires 15min, refresh 7d)
- [x] Add password strength requirements (frontend + backend enforced)
- [ ] Add password history (deferred)
- [ ] Add 2FA option for admin accounts (deferred)

### 19.2 Performance
- [ ] Add Redis caching (deferred — needs Redis instance)
- [x] CDN caching handled by Vercel edge (static pages prerendered)
- [x] Image lazy loading in ProductCard (loading=lazy)
- [x] Database connection pooling (connection_limit=1 for serverless)
- [x] API compression handled by Vercel (automatic gzip/brotli)
- [x] Static page generation for all content pages (○ prerendered)
- [x] Next.js automatic prefetching on Link hover
- [x] Code splitting via dynamic imports (CartDrawer, CheckoutFlow, etc.)

### 19.3 Monitoring
- [ ] Add error tracking (deferred — needs Sentry account)
- [ ] Add performance monitoring (deferred — needs Vercel Pro)
- [ ] Add uptime monitoring (deferred — external service)
- [x] Prisma logs errors and warnings in production
- [ ] Add alert system (deferred — needs monitoring service)

---

## Phase 20 — Seed Data & Content
> Add real products, categories, collections, journal articles

### 20.1 Categories
- [x] Create "Lighting" category (lamps, sconces, pendants)
- [x] Create "Mirrors" category (floor, wall, table)
- [x] Create "Plants & Planters" category (indoor plants, planters)
- [x] Create "Ceramics" category (vases, bowls, sculptures)
- [x] Create "Accessories" category (bookends, candles, trays)

### 20.2 Collections
- [x] Create "Summer Edit" collection
- [x] Create "Quiet Corners" collection
- [x] Create "The Lighting Edit" collection
- [x] Create "The Shelf Edit" collection

### 20.3 Products (minimum 20 products)
- [x] Add 5 lighting products (table lamps, floor lamps, sconces)
- [x] Add 3 mirror products (floor, wall, table)
- [x] Add 4 planter products (terracotta, ceramic, hanging)
- [x] Add 4 ceramic products (vases, bowls, sculptures)
- [x] Add 4 accessory products (bookends, candles, trays)
- [ ] Add product variants (sizes, colors) for applicable products
- [x] Add high-quality images for each product (1-2 images per product)
- [x] Set competitive PKR pricing (₨1,800 - ₨32,000 range)

### 20.4 Journal Articles
- [x] Write 5 journal articles:
  - [x] "The Art of Slow Living" (about slow sourcing)
  - [x] "Caring for Brass" (care guide + product spotlight)
  - [x] "Lighting Your Home for Winter" (design tips)
  - [x] "Meet Our Artisans" (workshop stories)
  - [x] "The Plant Edit" (indoor plant guide)

### 20.5 Care Guides
- [x] Write 4 care guides:
  - [x] "Caring for Brass" (polishing, patina)
  - [x] "Caring for Ceramics" (cleaning, chip repair)
  - [x] "Caring for Wood" (oiling, scratch repair)
  - [x] "Caring for Indoor Plants" (watering, light, repotting)

### 20.6 Press Features
- [x] Add 3 press features (Dawn Images, Mango Baaz, XpatMN)
- [x] Add Instagram posts (6 posts with images and captions)

---

## Phase 21 — Mobile & PWA
> Progressive Web App, mobile optimizations

### 21.1 PWA
- [ ] Verify manifest.webmanifest is correct
- [ ] Add service worker for offline support
- [ ] Add "Add to Home Screen" prompt
- [ ] Add push notification support (web push)

### 21.2 Mobile Optimizations
- [ ] Verify all pages are responsive (test on 320px, 375px, 414px widths)
- [ ] Add touch-friendly tap targets (min 44px)
- [ ] Optimize mobile navigation (hamburger menu, bottom tab bar)
- [ ] Add swipe gestures for product image gallery
- [ ] Add pull-to-refresh on product list

### 21.3 Mobile App Shell
- [ ] Add app-like transitions
- [ ] Add bottom navigation bar (Home, Shop, Cart, Account)
- [ ] Add sticky add-to-cart bar on mobile product pages

---

## Phase 22 — Localization & Compliance
> Multi-language, legal pages, GDPR

### 22.1 Localization
- [ ] Add Urdu language support (i18n)
- [ ] Add language toggle in header
- [ ] Translate key pages (home, shop, product, checkout)

### 22.2 Legal Pages
- [ ] Create `/terms` — Terms of Service
- [ ] Create `/privacy` — Privacy Policy
- [ ] Create `/returns` — Return Policy
- [ ] Create `/shipping-info` — Shipping Information
- [ ] Create `/contact` — Contact Page
- [ ] Add links to legal pages in Footer

### 22.3 Compliance
- [ ] Add cookie consent banner (already exists, verify)
- [ ] Add GDPR compliance (data export, data deletion)
- [ ] Add PCI compliance note (for payment gateways)
- [ ] Add age verification if needed

---

## Summary Checklist

| Phase | Description | Items | Priority |
|---|---|---|---|
| 11 | Content Management Completion | 9 sections | HIGH |
| 12 | Product System Enhancement | 7 sections | HIGH |
| 13 | Order System Enhancement | 6 sections | MEDIUM |
| 14 | Marketing & Email System | 5 sections | HIGH |
| 15 | Analytics & Insights | 6 sections | MEDIUM |
| 16 | Payment Gateway Integration | 4 sections | HIGH |
| 17 | Customer Experience | 5 sections | MEDIUM |
| 18 | Admin Settings & Configuration | 5 sections | MEDIUM |
| 19 | Security & Performance | 3 sections | HIGH |
| 20 | Seed Data & Content | 6 sections | HIGH |
| 21 | Mobile & PWA | 3 sections | LOW |
| 22 | Localization & Compliance | 3 sections | LOW |

### Total Items: ~120 individual tasks

### Recommended Build Order:
1. **Phase 20** (Seed Data) — fill the empty store so it looks real
2. **Phase 11** (Content Management) — complete all admin editors
3. **Phase 12** (Product Enhancement) — variants, collections, pagination
4. **Phase 14** (Email System) — transactional emails
5. **Phase 16** (Payment Gateways) — JazzCash, EasyPaisa
6. **Phase 13** (Order Enhancement) — search, invoices
7. **Phase 19** (Security) — rate limiting, CSRF, 2FA
8. **Phase 15** (Analytics) — page views, search analytics
9. **Phase 17** (Customer Experience) — wishlist sharing, Q&A
10. **Phase 18** (Settings) — editable config
11. **Phase 21** (Mobile/PWA) — offline support
12. **Phase 22** (Localization) — Urdu, legal pages

---

## Current Database Counts (as of 2026-06-30)

| Table | Count | Status |
|---|---|---|
| User | 2 | ✅ Admin + test user |
| Product | 21 | ✅ Seeded (Phase 20) |
| Category | 6 | ✅ Seeded (5 + 1 existing) |
| Collection | 4 | ✅ Seeded (Phase 20) |
| HeroSlide | 4 | ✅ Seeded |
| FaqItem | 6 | ✅ Seeded |
| Testimonial | 3 | ✅ Seeded |
| JournalArticle | 5 | ✅ Seeded (Phase 20) |
| CareGuide | 4 | ✅ Seeded (Phase 20) |
| BrandValue | 4 | ✅ Seeded |
| PressFeature | 3 | ✅ Seeded (Phase 20) |
| InstagramPost | 6 | ✅ Seeded (Phase 20) |
| PromoCode | 1 | ✅ WELCOME10 |
| ShippingMethod | 1 | ✅ Standard |
| FirstOrderOffer | 1 | ✅ Seeded |
| ExitIntentPopup | 1 | ✅ Seeded |
| Order | 2+ | ✅ Test orders |
| Review | 1 | ✅ Test review |
| Notification | 2+ | ✅ Working |
| EmailSubscriber | 0 | ⚠️ Will grow |
