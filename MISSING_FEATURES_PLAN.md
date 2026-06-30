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
- [ ] Create `/api/admin/content/first-order-offer/route.ts` (GET + PUT)
- [ ] Create `/admin/content/first-order-offer/page.tsx` — edit form (isActive, discountPercent, promoCode, popupTitle, popupDescription, bannerText, dismissDurationDays, showDelayMs)
- [ ] Add to admin nav under "Content" section

### 11.2 Exit Intent Popup Editor
- [ ] Create `/api/admin/content/exit-intent/route.ts` (GET + PUT)
- [ ] Create `/admin/content/exit-intent/page.tsx` — edit form (isActive, title, description, discountPercent, promoCode, imageUrl, triggerDelaySeconds)
- [ ] Fix `ExitIntentPopup.tsx` component to fetch from API (currently hardcoded)
- [ ] Add to admin nav under "Content" section

### 11.3 Brand Values Editor
- [ ] Create `/api/admin/content/brand-values/route.ts` (GET + POST)
- [ ] Create `/api/admin/content/brand-values/[id]/route.ts` (PUT + DELETE)
- [ ] Create `/admin/content/brand-values/page.tsx` — CRUD list

### 11.4 Press Features Editor
- [ ] Create `/api/admin/content/press/route.ts` (GET + POST)
- [ ] Create `/api/admin/content/press/[id]/route.ts` (PUT + DELETE)
- [ ] Create `/admin/content/press/page.tsx` — CRUD list

### 11.5 Instagram Posts Editor
- [ ] Create `/api/admin/content/instagram/route.ts` (GET + POST)
- [ ] Create `/api/admin/content/instagram/[id]/route.ts` (PUT + DELETE)
- [ ] Create `/admin/content/instagram/page.tsx` — CRUD list

### 11.6 Brand Marquee Items Editor
- [ ] Create `/api/admin/content/brand-marquee/route.ts` (GET + POST)
- [ ] Create `/api/admin/content/brand-marquee/[id]/route.ts` (PUT + DELETE)
- [ ] Create `/admin/content/brand-marquee/page.tsx` — CRUD list

### 11.7 Sustainability Content Editor
- [ ] Create `/api/admin/content/sustainability/route.ts` (GET + PUT)
- [ ] Create `/admin/content/sustainability/page.tsx` — edit form

### 11.8 Flash Sale Management
- [ ] Create `/api/admin/flash-sales/route.ts` (GET + POST)
- [ ] Create `/api/admin/flash-sales/[id]/route.ts` (PUT + DELETE)
- [ ] Create `/admin/flash-sales/page.tsx` — CRUD with date windows
- [ ] Create `/api/content/flash-sales/route.ts` — public active flash sale
- [ ] Add flash sale banner to storefront

### 11.9 Update Content Hub Page
- [ ] Update `/admin/content/page.tsx` — add links to all new content editors
- [ ] Remove "Full visual editors coming soon" notice

---

## Phase 12 — Product System Enhancement
> Product variants, collections assignment, pagination, bulk actions

### 12.1 Product Variants UI
- [ ] Add "Variants" section to product create form (`/admin/products/new`)
- [ ] Add "Variants" section to product edit form (`/admin/products/[id]/edit`)
- [ ] Each variant: label, swatchColor, stockQuantity, sortOrder, price modifier
- [ ] Update `/api/admin/products` POST to accept variants array
- [ ] Update `/api/admin/products/[id]` PUT to manage variants
- [ ] Update product detail page to show variant selector
- [ ] Update cart store to handle variant selection

### 12.2 Product Collection Assignment
- [ ] Add "Collections" multi-select to product create/edit forms
- [ ] Update `/api/admin/products` POST to accept collectionIds
- [ ] Update `/api/admin/products/[id]` PUT to manage collection assignments
- [ ] Show assigned collections in product list

### 12.3 Product Pagination
- [ ] Add pagination to `/admin/products` page (currently loads 200 at once)
- [ ] Add page controls (prev/next, page numbers)
- [ ] Show "Showing 1-20 of 145 products"

### 12.4 Product Bulk Actions
- [ ] Add checkbox selection to product list
- [ ] Add bulk actions bar: Activate, Deactivate, Feature, Delete
- [ ] Add bulk category assignment

### 12.5 Product Search & Filter
- [ ] Add category filter dropdown to product list
- [ ] Add price range filter
- [ ] Add stock status filter (in stock / out of stock / low stock)
- [ ] Add sort options (newest, price, name, stock)

### 12.6 Related Products
- [ ] Add "Related Products" field to product edit form
- [ ] Create API endpoint to get related products
- [ ] Show related products on product detail page

### 12.7 Product Import/Export
- [ ] Create `/api/admin/products/export` — CSV export of all products
- [ ] Create `/api/admin/products/import` — CSV import (bulk create)

---

## Phase 13 — Order System Enhancement
> Order search, pagination, invoices, status workflow

### 13.1 Order Search
- [ ] Add search by order number to `/admin/orders` page
- [ ] Add search by customer email
- [ ] Add date range filter (from/to date pickers)

### 13.2 Order Pagination
- [ ] Add pagination to `/admin/orders` page (currently loads 100)
- [ ] Add page controls

### 13.3 Order Invoice PDF
- [ ] Create `/api/admin/orders/[id]/invoice` — generate PDF invoice
- [ ] Add "Download Invoice" button to order detail page
- [ ] Add "Print Invoice" button

### 13.4 Order Status Workflow
- [ ] Add visual status timeline to order detail (processing → packed → shipped → delivered)
- [ ] Add timestamp for each status change
- [ ] Add "Order Notes" field (internal notes, not visible to customer)

### 13.5 Order Refund/Cancellation
- [ ] Add "Refund" button to order detail (for COD: mark as refunded)
- [ ] Add "Cancel Order" button with reason field
- [ ] Restock items on cancellation

### 13.6 Customer Order History in Admin
- [ ] Add "View Customer" link from order detail → customer detail page
- [ ] Show customer's full order history in customer detail

---

## Phase 14 — Marketing & Email System
> Email sending, abandoned cart, newsletters

### 14.1 Email Service Setup
- [ ] Choose email provider (Resend / SendGrid / Postmark)
- [ ] Create `src/lib/email.ts` — email sending helper
- [ ] Add email environment variables to `.env` and Vercel
- [ ] Create email template system (HTML templates)

### 14.2 Transactional Emails
- [ ] Order confirmation email (sent on order creation)
- [ ] Order status update email (sent on status change)
- [ ] Shipping notification email (with tracking number)
- [ ] Welcome email (sent on signup)
- [ ] Password reset email (sent on forgot-password)
- [ ] Review approved email (sent when admin approves review)

### 14.3 Newsletter System
- [ ] Create `/api/admin/newsletter/send` — send newsletter to all subscribers
- [ ] Create `/admin/newsletter/page.tsx` — compose and send newsletter
- [ ] Add unsubscribe link to emails
- [ ] Track email opens and clicks

### 14.4 Abandoned Cart Recovery
- [ ] Track cart abandonment (cart created but no order placed within 2 hours)
- [ ] Send abandoned cart email with link to recover cart
- [ ] Create `/admin/abandoned-carts/page.tsx` — view abandoned carts
- [ ] Auto-send reminder after 1 hour, 24 hours

### 14.5 Email Subscriber Management
- [ ] Add "Export to Mailchimp/CSV" button on subscribers page
- [ ] Add subscriber segmentation (by source, date, activity)
- [ ] Add subscriber import (CSV upload)

---

## Phase 15 — Analytics & Insights
> Enhanced analytics, page views, search analytics

### 15.1 Page View Tracking
- [ ] Create `/api/track/page-view` endpoint
- [ ] Add tracking script to all pages (log pathname, referrer, sessionId)
- [ ] Create `/admin/analytics/pages/page.tsx` — per-path page view breakdown
- [ ] Show top pages, traffic trends, bounce rate

### 15.2 Product View Tracking
- [ ] Create `/api/track/product-view` endpoint
- [ ] Add tracking to product detail page
- [ ] Show "Most Viewed Products" in analytics
- [ ] Show view-to-purchase conversion rate

### 15.3 Search Analytics
- [ ] Verify search logging works in `/api/products/search`
- [ ] Create `/admin/analytics/search/page.tsx` — search term analytics
- [ ] Show top searches, zero-result searches, search trends
- [ ] Add "suggested products" for zero-result searches

### 15.4 Cart Analytics
- [ ] Track cart events (add, remove, checkout start, checkout complete)
- [ ] Create `/admin/analytics/carts/page.tsx` — cart funnel
- [ ] Show cart abandonment rate, average cart value, conversion rate

### 15.5 Revenue Analytics
- [ ] Add revenue by category chart
- [ ] Add revenue by collection chart
- [ ] Add revenue by day-of-week heatmap
- [ ] Add customer lifetime value metric
- [ ] Add repeat purchase rate

### 15.6 Export Analytics
- [ ] Add "Export CSV" button to each analytics section
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
- [ ] Create `/api/user/wishlist/share` — generate shareable link
- [ ] Create `/wishlist/[shareId]` — public wishlist view
- [ ] Add "Share Wishlist" button to account wishlist page
- [ ] Add "Copy Link" button

### 17.2 Product Comparison
- [ ] Verify CompareTray component works
- [ ] Add "Compare" button to product cards
- [ ] Create comparison table (specifications side-by-side)
- [ ] Add "Remove from Compare" button
- [ ] Limit to 4 products in comparison

### 17.3 Recently Viewed Products
- [ ] Verify RecentlyViewed component works
- [ ] Track product views in localStorage
- [ ] Show "Recently Viewed" section on product detail page
- [ ] Show "Recently Viewed" section on home page

### 17.4 Review Enhancements
- [ ] Add photo upload to reviews (customers can share photos)
- [ ] Add review reply system (admin can reply to reviews)
- [ ] Add "Was this helpful?" voting (already exists, verify works)
- [ ] Add review sorting (most helpful, most recent, highest rating, lowest rating)
- [ ] Add review filtering (by rating, by verified buyer, with photos)

### 17.5 Product Q&A
- [ ] Create Question model (productId, userId, question, answer, answeredAt)
- [ ] Create `/api/products/[slug]/questions` — GET questions, POST question
- [ ] Create `/api/admin/questions` — admin Q&A management
- [ ] Add Q&A section to product detail page
- [ ] Add "Ask a Question" button

---

## Phase 18 — Admin Settings & Configuration
> Make settings page editable

### 18.1 Store Settings
- [ ] Create `/api/admin/settings` (GET + PUT)
- [ ] Create Settings model (key-value store)
- [ ] Make settings page editable:
  - [ ] Store name, logo, contact email, phone
  - [ ] Currency (PKR default, allow USD, EUR)
  - [ ] Tax rate (0% for Pakistan, configurable)
  - [ ] Free shipping threshold
  - [ ] Default shipping cost
  - [ ] Order number prefix
  - [ ] Social media links (Instagram, Facebook, Twitter)

### 18.2 Payment Settings
- [ ] Toggle payment methods on/off (COD, JazzCash, EasyPaisa, Bank Transfer)
- [ ] Configure payment gateway credentials
- [ ] Set minimum order amount for each payment method

### 18.3 Email Settings
- [ ] Configure SMTP/email provider settings
- [ ] Set sender email and name
- [ ] Test email configuration
- [ ] Toggle which emails to send (order confirmation, status updates, newsletter)

### 18.4 SEO Settings
- [ ] Edit meta title and description for each page
- [ ] Edit Open Graph images
- [ ] Edit robots.txt rules
- [ ] Edit sitemap priorities

### 18.5 Admin User Management
- [ ] Create `/admin/admin-users/page.tsx` — manage admin accounts
- [ ] Invite new admin (send email with signup link)
- [ ] Revoke admin access
- [ ] View admin activity log

---

## Phase 19 — Security & Performance
> Security hardening, performance optimization

### 19.1 Security
- [ ] Add rate limiting to auth endpoints (login, register, forgot-password)
- [ ] Add rate limiting to review submission
- [ ] Add CAPTCHA to login/signup forms
- [ ] Add CSRF protection to all POST/PUT/DELETE routes
- [ ] Add input sanitization for all text fields (strip HTML)
- [ ] Add file upload validation (magic number check, not just MIME type)
- [ ] Add session timeout (auto-logout after 30 minutes inactivity)
- [ ] Add password strength requirements (min 8 chars, 1 uppercase, 1 number, 1 special)
- [ ] Add password history (prevent reusing last 5 passwords)
- [ ] Add 2FA option for admin accounts

### 19.2 Performance
- [ ] Add Redis caching for product list and detail pages
- [ ] Add CDN caching headers for static assets
- [ ] Add image lazy loading to all product images
- [ ] Add database connection pooling optimization
- [ ] Add API response compression (gzip/brotli)
- [ ] Add static page generation for shop, about, journal pages
- [ ] Add prefetching for likely-next pages
- [ ] Optimize bundle size (code splitting, tree shaking)

### 19.3 Monitoring
- [ ] Add error tracking (Sentry)
- [ ] Add performance monitoring (Vercel Analytics)
- [ ] Add uptime monitoring
- [ ] Add database query logging (slow queries)
- [ ] Add alert system (email on error spike, downtime)

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
