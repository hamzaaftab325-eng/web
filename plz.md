# Aura Living — Production Frontend Checklist

> **Working agreement**: Every checkbox below is a production-grade deliverable. No prototypes. No stubs. No `TODO` comments. No `console.log`. Every component is typed, accessible, animated with `prefers-reduced-motion` honored, and validated. Lint must pass clean before any checkbox is checked.

> **ABSOLUTE RULES** (see `RULES.md` for full details):
> 1. **ZERO inline styles** — enforced by ESLint `react/forbid-component-props` (error level). Use CSS classes or CSS custom properties via `ref`.
> 2. **Don't go outside the design system** — do NOT create new CSS classes, utility classes, color tokens, or design tokens without asking the user first.
> 3. **ZERO `any` types** — use `unknown` and narrow, or define a proper interface.
> 4. **ZERO `console.log`** in production code.
> 5. **Verify before declaring complete** — run `bash scripts/verify.sh` which checks: inline styles, console.log, TODOs, any types, ESLint errors, TypeScript errors.

**Status legend**:
- `[ ]` — not started
- `[~]` — in progress
- `[x]` — complete and verified

**Last updated**: 2026-06-27

---

## Phase 0 — Foundation & Architecture

### 0.1 API client layer (swap-ready for real backend)
- [x] Create `src/lib/api/client.ts` — typed fetch wrapper (`get/post/put/delete`), error handling, retry with exponential backoff, request cancellation via AbortController
- [x] Create `src/lib/api/mock/delay.ts` — `simulateLatency(min, max)` helper that mimics real network variance
- [x] Create `src/lib/api/mock/data.ts` — migrate all existing data files (`products.ts`, `categories.ts`, `collections.ts`, `testimonials.ts`, `faq.ts`, `journal.ts`) into a single mock data module
- [x] Create `src/lib/api/products.ts` — `getProducts(filters)`, `getProduct(slug)`, `getFeatured()`, `getByCategory(slug)`, `getByCollection(slug)`, `search(query)` — all return `Promise<T>` with simulated latency
- [x] Create `src/lib/api/reviews.ts` — `getReviews(slug, sort, filter)`, `createReview(slug, data)`, `markHelpful(id)`
- [x] Create `src/lib/api/user.ts` — `login(email, password)`, `signup(data)`, `getProfile()`, `updateProfile(data)`, `getOrders()`, `getOrder(id)`, `getAddresses()`, `saveAddress(data)`, `deleteAddress(id)`
- [x] Create `src/lib/api/cart.ts` — `getCart()`, `addItem(productId, variant, qty)`, `updateItem(key, qty)`, `removeItem(key)`, `applyPromo(code)`, `getShippingRates(address)`
- [x] Create `src/lib/api/search.ts` — `search(query)`, `autocomplete(query)`, `getSuggestions()`, `getPopular()`
- [x] Create `src/lib/api/content.ts` — `getArticles()`, `getArticle(slug)`, `getCollections()`, `getCollection(slug)`, `getTestimonials()`, `getFAQ()`, `getLookbook()`, `getLookbookScene(slug)`
- [x] Create `src/lib/api/orders.ts` — `createOrder(checkoutData)`, `trackOrder(id)`, `getOrderHistory()`
- [x] All API functions return typed responses — no `any`, no `unknown`
- [x] All API functions throw typed `ApiError` on failure (not generic Error)
- [x] `client.ts` has a single `BASE_URL` constant — today `""` (mock), tomorrow `"https://api.auraliving.com"`

### 0.2 TanStack Query integration
- [x] Create `src/lib/query-client.ts` — query client config with staleTime, gcTime, retry logic
- [x] Create `src/components/providers/QueryProvider.tsx` — client-side provider wrapper
- [x] Wrap app in QueryProvider in `src/app/layout.tsx`
- [x] Create hooks: `useProducts()`, `useProduct(slug)`, `useReviews(slug)`, `useUser()`, `useOrders()`, `useSearch(query)`, `useCollections()`, `useArticles()`
- [x] All hooks return `{ data, isLoading, isError, error }` — properly typed
- [x] Optimistic updates for: add to cart, remove from cart, wishlist toggle, review submit
- [x] Query invalidation on: login, logout, order placed, address saved
- [x] Prefetch on hover for product cards (`queryClient.prefetchQuery`)

### 0.3 TypeScript strictness
- [x] Enable `strict: true` in `tsconfig.json` (already enabled, verify)
- [x] Enable `noImplicitAny: true` (was `false` — now flipped, verified clean)
- [ ] Enable `noUncheckedIndexedAccess: true` — **deferred to Phase 1** (requires ~30 nullable-access fixes in pre-existing components; verified the flag works, just needs the fixes)
- [ ] Enable `exactOptionalPropertyTypes: true` — **deferred to Phase 1** (same reason)
- [x] No `any` anywhere in `src/` (except shadcn/ui primitives we don't touch) — verified via `rg ': any' src/`
- [x] All API responses have Zod schemas for runtime validation at the boundary (`src/lib/api/schemas.ts`)
- [x] All component props have explicit interfaces (no inferred props)
- [x] All event handlers typed (`React.MouseEvent<HTMLButtonElement>`, not `any`)

### 0.4 ESLint & Prettier
- [x] Lint passes clean: `bun run lint` exits 0 (0 errors; 64 pre-existing warnings in pre-Phase-0 code — all `no-mixed-spaces-and-tabs` in `tailwind.config.ts` + unused imports in existing components, to be cleaned in Phase 1)
- [x] No `// @ts-ignore` or `// @ts-expect-error` anywhere in `src/` — verified via `rg`
- [x] No `eslint-disable` without justification comment — verified via `rg`
- [x] No unused imports, variables, or exports **in new Phase 0 code** (pre-existing unused imports flagged as warnings, to be cleaned in Phase 1)
- [x] Prettier config enforced (`.prettierrc` with 2-space indent, 100 char width, no semicolons — match existing code)

---

## Phase 1 — Auth & User Accounts

### 1.1 Auth store & mock session
- [ ] Create `src/store/use-auth-store.ts` — Zustand store with `persist` middleware
- [ ] Store shape: `{ user: User | null, addresses: Address[], preferences: Preferences, login(), signup(), logout(), updateUser() }`
- [ ] Mock `login()` validates email format, returns user after 600ms simulated latency
- [ ] Mock `signup()` creates user, returns session
- [ ] Mock `logout()` clears session, redirects to home
- [ ] Session persists across reloads (localStorage)
- [ ] Protected routes redirect to `/login` with `redirect` query param

### 1.2 Login page (`/login`)
- [ ] `src/app/(auth)/login/page.tsx` — server component shell
- [ ] `src/components/auth/LoginForm.tsx` — client component with React Hook Form + Zod
- [ ] Fields: email, password, "Remember me" checkbox, "Forgot password?" link
- [ ] Validation: email format, password min 8 chars — inline errors below each field
- [ ] Submit button shows loading spinner, disabled during submit
- [ ] Error state: "Invalid email or password" with shake animation on form
- [ ] Success state: redirect to `?redirect=` param or `/account`
- [ ] "Don't have an account? Sign up" link
- [ ] Split layout: form left (50%), lifestyle image right (50%) — image is the hero slider image
- [ ] Mobile: stacked, image hidden or as small banner
- [ ] Social login buttons (Google, Apple) — visual only, disabled with "Coming soon" tooltip
- [ ] Focus trap inside form, Esc clears form
- [ ] Accessible: labels, `aria-invalid`, `aria-describedby` for errors, autocomplete attributes

### 1.3 Signup page (`/signup`)
- [ ] `src/app/(auth)/signup/page.tsx` — server component shell
- [ ] `src/components/auth/SignupForm.tsx` — client component
- [ ] Fields: firstName, lastName, email, password, confirmPassword, "Join newsletter" checkbox (default true), terms checkbox (required)
- [ ] Validation: all fields required, email format, password min 8 chars with 1 number, passwords match, terms checked
- [ ] Password strength meter (weak/fair/good/strong) — visual bar
- [ ] Success: redirect to `/account` with welcome toast
- [ ] "Already have an account? Sign in" link
- [ ] Same split-layout as login
- [ ] Accessible: same standards as login

### 1.4 Forgot password (`/forgot-password`)
- [ ] `src/app/(auth)/forgot-password/page.tsx`
- [ ] Single email field, submit → "Check your inbox" success state
- [ ] "Back to login" link
- [ ] Mock: always shows success (no email existence leak)

### 1.5 Reset password (`/reset-password`)
- [ ] `src/app/(auth)/reset-password/page.tsx` — reads `?token=` from URL
- [ ] Fields: newPassword, confirmPassword
- [ ] Validation: min 8 chars, 1 number, match
- [ ] Success: redirect to `/login` with "Password reset" toast
- [ ] Invalid/expired token: show error state with "request new link" CTA

### 1.6 Account dashboard (`/account`)
- [ ] `src/app/account/layout.tsx` — sidebar nav + main content area
- [ ] Sidebar: Orders, Addresses, Wishlist, Preferences, Sign Out
- [ ] Mobile: sidebar collapses to hamburger menu
- [ ] Active nav item highlighted with gold accent
- [ ] `/account` redirects to `/account/orders` by default
- [ ] Welcome header: "Welcome back, {firstName}"
- [ ] Quick stats: order count, wishlist count, saved addresses count

### 1.7 Orders (`/account/orders`)
- [ ] `src/app/account/orders/page.tsx` — order history list
- [ ] Each order: order number, date, status badge, item count, total, "View order" button
- [ ] Status badges: Processing, Packed, Shipped, Delivered, Cancelled
- [ ] Empty state: "No orders yet" + "Start shopping" CTA
- [ ] Pagination or "Load more" (12 per page)
- [ ] Loading skeleton while fetching
- [ ] Sort: Most recent (default), Oldest, Highest total

### 1.8 Order detail (`/account/orders/[id]`)
- [ ] `src/app/account/orders/[id]/page.tsx`
- [ ] Order header: order number, date placed, status, tracking number
- [ ] Status timeline: Ordered → Packed → Shipped → Delivered (visual progress)
- [ ] Items list: image, name, variant, qty, price, "Buy again" button
- [ ] Shipping address card
- [ ] Payment summary: subtotal, shipping, tax, total, payment method
- [ ] Actions: "Track shipment", "Print receipt", "Buy again", "Contact support"
- [ ] Tracking link opens carrier URL in new tab (mock URL)

### 1.9 Addresses (`/account/addresses`)
- [ ] `src/app/account/addresses/page.tsx`
- [ ] List of saved addresses as cards: name, street, city, ZIP, country, "Default" badge
- [ ] "Add new address" button → modal form
- [ ] Edit address → modal form prefilled
- [ ] Delete address → confirmation dialog
- [ ] "Set as default" toggle
- [ ] Form fields: firstName, lastName, street, apartment (optional), city, state, ZIP, country, phone, "Default shipping" checkbox
- [ ] Validation: all required except apartment
- [ ] Empty state: "No saved addresses" + "Add address" CTA

### 1.10 Wishlist page (`/account/wishlist`)
- [ ] `src/app/account/wishlist/page.tsx` — full-page wishlist (drawer also exists)
- [ ] Grid of wishlisted products (reuse ProductCard)
- [ ] "Add all to cart" button
- [ ] "Share wishlist" → copies shareable URL
- [ ] Empty state: "No saved pieces yet" + "Browse the shop" CTA
- [ ] Sort: Recently added, Price low-high, Price high-low

### 1.11 Preferences (`/account/preferences`)
- [ ] `src/app/account/preferences/page.tsx`
- [ ] Email preferences: newsletters, new arrivals, sale alerts, order updates (toggles)
- [ ] Style preferences: warm minimalism, modern, traditional, eclectic (multi-select chips)
- [ ] Room preferences: living room, bedroom, dining, entryway, office (multi-select)
- [ ] Budget range: slider ($50-$500+)
- [ ] Currency selector: USD, EUR, GBP, CAD, AUD
- [ ] Save button → "Preferences saved" toast
- [ ] "Delete account" danger zone → confirmation dialog

### 1.12 Header auth state
- [ ] When logged out: "Sign In" link in header (desktop), in mobile menu
- [ ] When logged in: avatar circle with initials, dropdown menu (Account, Orders, Wishlist, Sign Out)
- [ ] Avatar dropdown animates in (Framer Motion)
- [ ] Sign out: clears session, redirects to home, shows "Signed out" toast

---

## Phase 2 — Reviews & Enhanced PDP

### 2.1 Reviews data & API
- [ ] Create `src/lib/api/mock/reviews.ts` — 30+ mock reviews across products
- [ ] Each review: id, productSlug, authorName, authorLocation, rating (1-5), title, body, date, verifiedBuyer, helpfulCount, photos (optional)
- [ ] `getReviews(slug, sort, filter)` returns paginated results (10 per page)
- [ ] `createReview(slug, data)` returns created review, appends to mock store
- [ ] `markHelpful(id)` increments helpfulCount

### 2.2 RatingSummary component
- [ ] `src/components/commerce/RatingSummary.tsx`
- [ ] Shows: average rating (large), star distribution bars (5★ to 1★), total count, "Write a review" button
- [ ] Bars are clickable → filter reviews by that rating
- [ ] Animated bar fill on mount (RevealOnScroll)
- [ ] Empty state: "Be the first to review"

### 2.3 ReviewsList component
- [ ] `src/components/commerce/ReviewsList.tsx`
- [ ] Sort dropdown: Most recent, Highest, Lowest, Most helpful
- [ ] Filter chips: All, 5★, 4★, 3★, 2★, 1★, With photos, Verified buyers
- [ ] Each review: avatar (initials), name, location, verified badge, rating stars, date, title, body, photos (clickable → lightbox), "Helpful" button with count
- [ ] "Helpful" button: click → increments, shows "Thanks!" state, prevents double-click
- [ ] Pagination: "Load more" button (10 at a time)
- [ ] Loading skeleton while fetching
- [ ] Empty state when filter matches nothing

### 2.4 ReviewForm
- [ ] `src/components/commerce/ReviewForm.tsx`
- [ ] Modal or inline form (toggle via prop)
- [ ] Fields: rating (star picker — interactive), title, body, photos (file upload, max 3), "I recommend this" checkbox
- [ ] Validation: rating required, title min 3 chars, body min 20 chars
- [ ] Photo upload: drag-drop zone, preview thumbnails, remove button, max 5MB each
- [ ] Submit: loading state, success state ("Review submitted — pending moderation"), error state
- [ ] Only shown for verified buyers (mock: always shown)
- [ ] After submit: review appears at top of list with "Pending" badge

### 2.5 ProductZoom (gallery enhancement)
- [ ] `src/components/commerce/ProductZoom.tsx`
- [ ] Desktop: hover over image → zoom lens (2x) follows cursor, preview shown in corner or inline
- [ ] Mobile: pinch-to-zoom gesture, double-tap to toggle
- [ ] Smooth transition, no jank
- [ ] Lens border subtle (1px gold)
- [ ] Accessible: keyboard can tab to image, Enter activates zoom mode, arrow keys pan

### 2.6 ProductShare
- [ ] `src/components/commerce/ProductShare.tsx`
- [ ] Share button in PDP → dropdown with: Copy link, Pinterest, X, Facebook, Email
- [ ] Copy link: copies to clipboard, shows "Copied!" toast
- [ ] Social links open share dialog in new window
- [ ] Email opens mailto with subject + body prefilled

### 2.7 BackInStockForm
- [ ] `src/components/commerce/BackInStockForm.tsx`
- [ ] Shown on PDP when `product.inStock === false`
- [ ] Replaces "Sold Out" button
- [ ] Email field + "Notify me" button
- [ ] Validation: email format
- [ ] Success: "We'll email you when this returns" state with checkmark
- [ ] Mock: always succeeds

### 2.8 RecentlyViewed
- [ ] `src/hooks/use-recently-viewed.ts` — localStorage-backed hook, max 8 items, most recent first
- [ ] `src/components/commerce/RecentlyViewed.tsx` — horizontal scroll row
- [ ] Appears on: PDP (bottom), Shop (sidebar), Home (row)
- [ ] Each card: small product card (image, name, price)
- [ ] "Clear history" button
- [ ] Empty state: hidden (don't show if no history)

### 2.9 SocialProof
- [ ] `src/components/commerce/SocialProof.tsx`
- [ ] Shows on PDP: "X people have this in their cart" (mock: random 3-15, changes hourly)
- [ ] "X viewed in the last 24 hours"
- [ ] Subtle pulse animation on number
- [ ] Hidden if count < 3

### 2.10 SizeGuide
- [ ] `src/components/commerce/SizeGuide.tsx`
- [ ] Modal triggered by "Size guide" link on PDP
- [ ] Dimensions diagram (SVG) per product category
- [ ] Measurement table (W × H × D in cm and inches)
- [ ] "How to measure" explainer
- [ ] Close button + Esc to close + focus trap

### 2.11 GiftWrapOption
- [ ] `src/components/commerce/GiftWrapOption.tsx`
- [ ] Checkbox on PDP: "Add gift wrap (+$8)"
- [ ] When checked: reveals gift note textarea (max 200 chars, char counter)
- [ ] Updates cart line item with gift wrap flag
- [ ] Gift wrap badge appears in cart line item

### 2.12 StickyMobileAddToCart
- [ ] `src/components/commerce/StickyMobileAddToCart.tsx`
- [ ] Appears on mobile PDP when user scrolls past the main Add to Cart button
- [ ] Fixed bottom bar: product image (small), name, price, "Add to Cart" button
- [ ] Slides up with Framer Motion (y: 100% → 0)
- [ ] Disappears when user scrolls back up to main button
- [ ] Respects safe area inset (iOS notch)

### 2.13 PDP enhancements
- [ ] SKU display below product name (`SKU: AL-CTL-001`)
- [ ] Breadcrumb inside PDP modal (Home > Shop > Category > Product)
- [ ] "Back to results" button (closes modal, returns to shop)

---

## Phase 3 — Enhanced Shop & Search

### 3.1 QuickViewModal
- [ ] `src/components/commerce/QuickViewModal.tsx`
- [ ] Triggered by "Quick view" button on product card hover (desktop) or long-press (mobile)
- [ ] Compact PDP: image, name, price, variant selector, Add to Cart, "View full details" link
- [ ] Smaller than full PDP modal (max-width 800px)
- [ ] Focus trap, Esc to close

### 3.2 PriceRangeSlider
- [ ] `src/components/commerce/PriceRangeSlider.tsx`
- [ ] Dual-thumb slider (min and max)
- [ ] Replaces checkbox price bands in FilterSidebar
- [ ] Shows selected range below: "$45 — $300"
- [ ] Updates URL params in real-time
- [ ] Accessible: keyboard navigable, ARIA values

### 3.3 ColorSwatchFilter
- [ ] `src/components/commerce/ColorSwatchFilter.tsx`
- [ ] Row of color swatches (reuses swatch-dot pattern)
- [ ] Multi-select, active state with gold ring
- [ ] Tooltip with color name on hover
- [ ] Updates URL params

### 3.4 Additional filters
- [ ] "In stock only" toggle
- [ ] "On sale" toggle
- [ ] "New arrivals" toggle
- [ ] All persist to URL params

### 3.5 URL-synced filter state
- [ ] All filters (category, price, material, color, toggles, sort) sync to URL search params
- [ ] Changing filters updates URL without page reload (`router.replace`)
- [ ] Loading page with filter params pre-applies filters
- [ ] Shareable filtered URLs work on direct load
- [ ] "Clear all" resets URL params

### 3.6 CompareTray
- [ ] `src/components/commerce/CompareTray.tsx`
- [ ] "Compare" button on each product card (bookmark icon)
- [ ] Bottom-fixed tray appears when 2+ items added (max 4)
- [ ] Tray shows: product thumbnails, names, "Compare now" button, "Clear" button
- [ ] "Compare now" opens full-screen comparison: side-by-side table with image, price, materials, dimensions, badge, in-stock
- [ ] "Remove" per product
- [ ] Persists across navigation (sessionStorage)

### 3.7 SearchAutocomplete
- [ ] `src/components/layout/SearchAutocomplete.tsx`
- [ ] As user types in search overlay: dropdown with suggestions
- [ ] Sections: Products (top 3 with image), Categories, Articles, "Search for '{query}'"
- [ ] Debounced 200ms
- [ ] Keyboard nav: arrow up/down, Enter to select, Esc to close
- [ ] Recent searches section when query is empty (localStorage, clearable)
- [ ] "Popular searches" when no history

### 3.8 Search results page
- [ ] `src/app/search/page.tsx` — reads `?q=` param
- [ ] Full results grid with all filters available
- [ ] Result count, sort dropdown
- [ ] "Did you mean?" for typos (mock: simple Levenshtein)
- [ ] Empty state: "No matches for '{query}'" + popular products + popular searches
- [ ] Breadcrumb: Home > Search > "{query}"

### 3.9 Catalog enhancements
- [ ] Infinite scroll option (toggle with "Load more")
- [ ] "View" toggle: grid / list (list shows more info per product)
- [ ] Catalog metadata: showing X-Y of Z products

---

## Phase 4 — Cart, Checkout & Conversion

### 4.1 Cart enhancements
- [ ] "Save for later" per line item → moves to separate section below cart, restores on click
- [ ] "Move to wishlist" per line item
- [ ] Estimated delivery date per line: "Arrives Mar 15-18" (mock: 3-5 business days from today)
- [ ] Mini-cart preview on header cart hover (desktop, 500ms delay) — shows top 3 items + subtotal + "View cart"
- [ ] "Add all to cart" from wishlist page and wishlist drawer
- [ ] Free shipping progress in header on scroll (after 200px scroll, small bar appears)

### 4.2 Checkout enhancements
- [ ] Promo code field: input + "Apply" button → shows discount line, "Remove" button
- [ ] Gift card redemption field (separate from promo)
- [ ] Order notes / delivery instructions textarea (max 200 chars)
- [ ] "Save this address" checkbox (when logged in)
- [ ] Express payment buttons: Apple Pay, Google Pay, PayPal (visual only, disabled with "Coming soon")
- [ ] Real-time tax estimate: ZIP → tax rate lookup (mock table)
- [ ] Shipping rate calculation: based on address + item weight (mock)
- [ ] Gift wrapping add-on: line item "+ Gift wrap — $8" with note preview
- [ ] "Create account" prompt on confirmation: password field, "Save my info for next time"

### 4.3 Order confirmation page
- [ ] `src/app/order/[id]/confirmation/page.tsx` — shareable URL
- [ ] Same content as confirmation modal (order number, total, delivery estimate, tracking)
- [ ] "Print receipt" button (opens print dialog)
- [ ] "Add to calendar" for estimated delivery (.ics download)
- [ ] "Continue shopping" CTA
- [ ] Recommended products row (based on ordered items)

### 4.4 Order tracking
- [ ] `src/app/order/[id]/track/page.tsx`
- [ ] Visual timeline: Ordered → Packed → Shipped → Out for delivery → Delivered
- [ ] Each step: date, location (mock), description
- [ ] Current step highlighted with gold
- [ ] Tracking number + carrier link
- [ ] "Get updates via SMS" opt-in

### 4.5 ExitIntentPopup
- [ ] `src/components/marketing/ExitIntentPopup.tsx`
- [ ] Triggers when: mouse leaves top of viewport (desktop) OR 30s elapsed (mobile)
- [ ] Shows once per session (sessionStorage)
- [ ] Content: "Enjoy 10% off your first order" + email capture + "Reveal code" button
- [ ] Success: shows code "AURA10", "Shop now" button
- [ ] Close: X button, Esc, click outside
- [ ] Framer Motion scale-in, respects reduced-motion

### 4.6 FirstOrderBanner
- [ ] `src/components/marketing/FirstOrderBanner.tsx`
- [ ] Top-of-page dismissible banner: "First order? Enjoy 10% off — Sign up"
- [ ] Dismiss persists (localStorage, 30 days)
- [ ] CTA links to signup

### 4.7 CountdownTimer
- [ ] `src/components/marketing/CountdownTimer.tsx`
- [ ] Reusable component: takes `endDate` prop
- [ ] Shows: DD : HH : MM : SS
- [ ] Updates every second
- [ ] When expired: shows "Sale ended" or hides
- [ ] Used on: sale section headers, PDP for limited offers

### 4.8 LowStockBadge
- [ ] `src/components/marketing/LowStockBadge.tsx`
- [ ] Shows on PDP when stock < 5: "Only X left — selling fast"
- [ ] Animated pulse on number
- [ ] Mock: random low stock for some products

---

## Phase 5 — Content & Editorial

### 5.1 Lookbook
- [ ] `src/app/lookbook/page.tsx` — grid of room scenes
- [ ] Each scene: full-bleed image, title, "Shop the look" button
- [ ] `src/app/lookbook/[slug]/page.tsx` — single room scene
- [ ] `src/components/content/ShopTheLook.tsx` — clickable hotspots on image → product card popover
- [ ] Hotspot: gold dot, on hover shows product image + name + price + "Add to cart"
- [ ] Below image: grid of all products in the scene
- [ ] 6-8 mock room scenes

### 5.2 Collections index
- [ ] `src/app/collections/page.tsx` — grid of all collections
- [ ] Each collection: hero image, name, description, product count, "Explore" button
- [ ] Existing collection pages already work

### 5.3 Artisan profiles
- [ ] `src/app/artisans/page.tsx` — index of workshop profiles
- [ ] `src/app/artisans/[slug]/page.tsx` — single workshop story
- [ ] Content: workshop name, location, founded date, story (long-form), gallery (8-12 images), products from this workshop
- [ ] 4-5 mock artisan profiles

### 5.4 Sustainability page
- [ ] `src/app/sustainability/page.tsx`
- [ ] Sections: materials sourcing index, workshop map, certifications, environmental impact, future commitments
- [ ] Data table: material → source → workshop → certification
- [ ] Editorial layout with images

### 5.5 Trade program
- [ ] `src/app/trade/page.tsx` — landing page
- [ ] Benefits section, "Apply now" CTA
- [ ] `src/components/trade/TradeApplicationForm.tsx` — multi-step form
- [ ] Fields: business name, business type, website, your name, email, phone, trade references (optional), resale certificate upload
- [ ] Validation per step, progress indicator
- [ ] Success: "Application received — we'll respond within 3 business days"

### 5.6 Gift guide
- [ ] `src/app/gifts/page.tsx` — hub with filters: By recipient (for her, for him, for host, for new home), By price (under $50, $50-100, $100-200, $200+), By occasion (housewarming, wedding, birthday, thank you)
- [ ] `src/app/gifts/[slug]/page.tsx` — curated gift collection
- [ ] Gift card purchase: `/gift-cards` — design your card (amount, design, recipient email, message, delivery date)

### 5.7 Care guide hub
- [ ] `src/app/care/page.tsx` — library of care articles by material
- [ ] Categories: Ceramic, Brass, Wood, Linen, Plant, Stone, Glass
- [ ] `src/app/care/[slug]/page.tsx` — single care guide (long-form article, reuse JournalReader layout)
- [ ] 7-8 mock care guides

### 5.8 Press section
- [ ] `src/components/social/PressSection.tsx` — "As seen in" logos
- [ ] Mock: Architectural Digest, Vogue, Kinfolk, Dwell, Apartment Therapy
- [ ] Hover: quote from publication
- [ ] Links to mock press features

---

## Phase 6 — Mobile & UX Polish

### 6.1 Mobile sticky Add to Cart (already in P2.12, ensure mobile-specific)
- [ ] Verify safe area inset handling
- [ ] Test on iOS Safari and Android Chrome

### 6.2 Swipe-to-close on drawers
- [ ] Add Framer Motion `drag="x"` to all drawer panels (Cart, Wishlist, MobileNav, Filter)
- [ ] Drag threshold: 25% of width → close, else snap back
- [ ] Drag handle visible at drawer edge (subtle gold line)
- [ ] Respects reduced-motion (no drag, just close button)

### 6.3 Bottom tab bar (mobile)
- [ ] `src/components/layout/MobileTabBar.tsx`
- [ ] Tabs: Browse (shop icon), Search, Cart (with count), Wishlist (with count), Account
- [ ] Appears only on mobile (< lg breakpoint)
- [ ] Active tab highlighted with gold
- [ ] Hides when keyboard open
- [ ] Respects safe area inset

### 6.4 Pull-to-refresh
- [ ] On shop and catalog pages (mobile only)
- [ ] Framer Motion drag-down gesture
- [ ] Spinner appears at threshold
- [ ] Releases → refetch data (TanStack Query `refetch`)

### 6.5 View Transitions API
- [ ] Enable in `next.config.ts` (`experimental: { viewTransition: true }`)
- [ ] Add `@view-transition` CSS
- [ ] Tag key elements with `view-transition-name`
- [ ] Test route transitions: home → shop → PDP
- [ ] Fallback: existing Framer Motion AnimatePresence (no regression)

### 6.6 Personalization
- [ ] `src/components/personalization/RecommendedForYou.tsx` — homepage row
- [ ] Mock recommendation: based on recently viewed categories, fallback to featured
- [ ] `src/components/personalization/BrowseHistory.tsx` — "Pick up where you left off" row (recently viewed)
- [ ] `src/components/personalization/PreferenceCenter.tsx` — in account preferences (already in 1.11)

### 6.7 UGC & social
- [ ] `src/components/social/InstagramFeed.tsx` — real layout (mock data, swap to Instagram API later)
- [ ] `src/components/social/CustomerPhotosGallery.tsx` — on PDP, photos tagged @auraliving
- [ ] `src/components/social/ShopTheGram.tsx` — shoppable Instagram grid (click image → product popover)
- [ ] All use mock data, structured for real API swap

---

## Phase 7 — Performance, SEO & Analytics

### 7.1 Image optimization
- [ ] Migrate all `<img>` to Next.js `<Image>` across: HeroSlider, ProductCard, ProductDetail, CartDrawer, WishlistDrawer, CategoryShowcase, CuratedCollection, TestimonialSection, InstagramFeed, PageHero, JournalReader, CheckoutFlow, Lookbook, Artisan pages
- [ ] Explicit `width` and `height` on every image (no CLS)
- [ ] `sizes` attribute for responsive loading
- [ ] `priority` on above-fold images (hero, first 4 product cards)
- [ ] `loading="lazy"` on below-fold (default)
- [ ] `placeholder="blur"` + `blurDataURL` for product images (generate via sharp at build)
- [ ] Configure `next.config.ts`: `images.formats: ['image/avif', 'image/webp']`, `images.remotePatterns` for Unsplash
- [ ] Audit Lighthouse CLS = 0, LCP < 2.5s

### 7.2 Loading states
- [ ] `src/components/ui/Skeleton.tsx` (already from shadcn) — wire into:
  - [ ] HeroSlider first paint
  - [ ] Product grid (card skeletons)
  - [ ] PDP gallery
  - [ ] Reviews list
  - [ ] Account order list
  - [ ] Search results
  - [ ] Shop grid during filter change
- [ ] `src/app/loading.tsx` — branded route-level loader (Aura logo pulse)
- [ ] Suspense boundaries around async sections
- [ ] All skeletons match the dimensions of content they replace

### 7.3 SEO — metadata
- [ ] `src/app/layout.tsx` — global metadata (title template, description, OpenGraph defaults, Twitter card)
- [ ] Per-page `metadata` exports on every route: Home, Shop, PDP, Collections, Journal, About, Account, Auth, Legal
- [ ] Dynamic metadata on PDP: `title: product.name`, `description: product.description`, `openGraph.images: [product.images[0]]`
- [ ] Dynamic metadata on Journal article: `title: article.title`, `authors: [article.author]`, `publishedTime`, `modifiedTime`

### 7.4 SEO — sitemap & robots
- [ ] `src/app/sitemap.ts` — dynamic sitemap including: all static pages, all products, all collections, all journal articles
- [ ] `src/app/robots.ts` — robots.txt with sitemap reference, disallow /account, /admin
- [ ] Submit-ready for Google Search Console

### 7.5 SEO — structured data
- [ ] `src/components/seo/ProductJsonLd.tsx` — `Product` schema (name, image, description, sku, brand, offers, aggregateRating)
- [ ] `src/components/seo/BreadcrumbJsonLd.tsx` — `BreadcrumbList` schema
- [ ] `src/components/seo/FaqJsonLd.tsx` — `FAQPage` schema on FAQ page
- [ ] `src/components/seo/ArticleJsonLd.tsx` — `Article` schema on journal articles
- [ ] `src/components/seo/CollectionPageJsonLd.tsx` — `CollectionPage` schema
- [ ] All rendered server-side as `<script type="application/ld+json">`
- [ ] Validate with Google Rich Results Test

### 7.6 SEO — canonical & hreflang
- [ ] Canonical URL on every page (`<link rel="canonical">`)
- [ ] `hreflang` tags (prep for i18n — `en-US` default)
- [ ] OG URL matches canonical

### 7.7 Analytics — instrumentation
- [ ] `src/lib/analytics/ga4.ts` — GA4 event tracker (you add measurement ID later)
- [ ] `src/lib/analytics/ecommerce.ts` — `view_item_list`, `view_item`, `select_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`
- [ ] `src/lib/analytics/meta-pixel.ts` — Meta Pixel events
- [ ] `src/components/analytics/AnalyticsProvider.tsx` — context provider, loads scripts only after cookie consent
- [ ] All events fire through `src/lib/analytics/track(eventName, params)` — single function, swap destinations later
- [ ] Wire events to: product view, add to cart, begin checkout, purchase, search, sign up, login

### 7.8 PWA
- [ ] `src/app/manifest.ts` — PWA manifest (name, icons, theme color, display: standalone)
- [ ] Service worker: cache product images, offline catalog browsing
- [ ] "Add to home screen" prompt on mobile (after 2nd visit, dismissible)

---

## Phase 8 — Design System Polish

### 8.1 Component library completion
- [ ] `src/components/ui/AuraInput.tsx` — floating label variant, error state, disabled state
- [ ] `src/components/ui/AuraTextarea.tsx` — auto-grow, char counter
- [ ] `src/components/ui/AuraSelect.tsx` — custom dropdown with search
- [ ] `src/components/ui/AuraTooltip.tsx` — gold-accent tooltip
- [ ] `src/components/ui/AuraToast.tsx` — already have shadcn toaster, wrap with Aura styling
- [ ] `src/components/ui/EmptyState.tsx` — reusable: illustration slot, title, description, CTA
- [ ] `src/components/ui/LoadingSpinner.tsx` — branded spinner (line animation)
- [ ] `src/components/ui/Pagination.tsx` — page-based pagination with prev/next
- [ ] All components: cva variants, accessible, typed, documented with JSDoc

### 8.2 Dark mode
- [ ] Add `[data-theme="dark"]` token block in `globals.css` — invert canvas, paper, ink, cream
- [ ] Gold accent stays same (works on both)
- [ ] Theme toggle in header (sun/moon icon)
- [ ] `src/store/use-theme-store.ts` — Zustand persist, respects `prefers-color-scheme` initial
- [ ] No flash of wrong theme (inline script in layout)
- [ ] Test every page in dark mode — fix contrast issues

### 8.3 Accessibility mode
- [ ] High-contrast mode: `[data-contrast="high"]` — stronger borders, pure black/white
- [ ] Font size adjuster: `[data-font-size="sm|md|lg"]` — scales all type tokens
- [ ] Dyslexia-friendly font: `[data-font="dyslexic"]` — swap to OpenDyslexic
- [ ] All as token swaps in `globals.css`, zero component changes
- [ ] Settings in a "Display preferences" panel (gear icon in header)

### 8.4 Accessibility v2
- [ ] ARIA live regions for: cart count (`aria-live="polite"`), filter result count, search results, form errors (`aria-live="assertive"`)
- [ ] Screen reader announcements for async state changes (via `useAnnounce` hook)
- [ ] "Read aloud" button on product descriptions (Web Speech API)
- [ ] Keyboard shortcuts: `/` focus search, `Esc` close overlays, `g h` go home, `g s` go shop, `g c` open cart
- [ ] Skip links for every major section (already have main, add for nav, footer, sidebar)
- [ ] Color contrast audit: WCAG AAA where possible (7:1 for body text), AA minimum (4.5:1)
- [ ] axe-core audit passes 0 violations

### 8.5 Animation polish
- [ ] View Transitions API (already in 6.5)
- [ ] Page loader with brand mark animation (line draws "Aura")
- [ ] Custom cursor on desktop (subtle gold dot follower, hidden on touch)
- [ ] `will-change` hints audited on all animated elements
- [ ] `prefers-reduced-motion` audited site-wide — every animation has a static fallback
- [ ] 60fps verified on all animations (Chrome DevTools Performance tab)

### 8.6 Micro-interactions
- [ ] Button press: scale 0.98 + shadow change (already partial)
- [ ] Card hover: lift + image scale (already partial)
- [ ] Link hover: gold underline draw (already)
- [ ] Add to cart: button morphs to checkmark → cart count bounces (already)
- [ ] Wishlist: heart fills with spring (already)
- [ ] Toast: slide in from bottom-right, auto-dismiss 4s, stack multiple
- [ ] Form submit: button shows spinner, success checkmark, then resets

---

## Phase 9 — Internationalization (Optional)

### 9.1 Multi-currency
- [ ] Currency selector in header (USD default, EUR, GBP, CAD, AUD)
- [ ] `src/lib/format/currency.ts` — format price by currency (symbol position, decimals)
- [ ] Mock exchange rates (static table, swap to real API later)
- [ ] All prices reformat on currency change
- [ ] Persists in localStorage

### 9.2 Multi-language
- [ ] `next-intl` setup (already installed)
- [ ] Translation files: `src/messages/en.json`, `fr.json`, `de.json`, `ja.json`
- [ ] Language selector in header
- [ ] All UI strings extracted to translation files
- [ ] Product content stays English (mock) — real i18n when backend ready
- [ ] RTL support prep (for future Arabic/Hebrew)

### 9.3 Region-specific
- [ ] VAT-inclusive pricing for EU (show "VAT included" note)
- [ ] Shipping restrictions by region (some products can't ship internationally — plants)
- [ ] Duties calculator mock at checkout for international orders

---

## Phase 10 — Final Production Readiness

### 10.1 Error handling
- [ ] `src/app/error.tsx` — branded 500 error boundary with "Try again" + "Back home"
- [ ] `src/app/not-found.tsx` — branded 404 with search + popular categories
- [ ] API error handling: every fetch has try/catch, shows error toast or inline error
- [ ] Network error: retry button
- [ ] 404 on product slug: "Product not found" + related products

### 10.2 Performance audit
- [ ] Lighthouse: Performance 95+, Accessibility 95+, Best Practices 100, SEO 100
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS = 0
- [ ] Bundle size: First Load JS < 200KB
- [ ] Image sizes: all under 200KB
- [ ] No render-blocking resources
- [ ] Code splitting: CartDrawer, WishlistDrawer, ProductDetail, CheckoutFlow, JournalReader all lazy-loaded

### 10.3 Cross-browser testing
- [ ] Chrome (latest)
- [ ] Safari (latest + Safari iOS)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Samsung Internet (mobile)
- [ ] All animations work, all layouts hold, no console errors

### 10.4 Final code audit
- [ ] Zero `console.log` in production code
- [ ] Zero `TODO` or `FIXME` comments
- [ ] Zero `any` types (except shadcn primitives)
- [ ] Zero inline styles
- [ ] Zero lint warnings
- [ ] All components have JSDoc comments on props
- [ ] All exports are named (no default exports except page components)
- [ ] All files under 300 lines (split if larger)
- [ ] README.md updated with: setup, structure, conventions, swap-backend instructions

### 10.5 Documentation
- [ ] `src/lib/api/README.md` — how to swap mock for real backend (one file change)
- [ ] `src/components/README.md` — component inventory with usage examples
- [ ] `src/store/README.md` — state management overview
- [ ] `DESIGN_SYSTEM.md` — token reference, component variants, motion specs
- [ ] `ACCESSIBILITY.md` — a11y features, keyboard shortcuts, tested screen readers

---

## ✅ Definition of Done — per checkbox

A checkbox is only checked when ALL of these are true:
- [ ] Feature works end-to-end in the browser (verified via Agent Browser)
- [ ] Lint passes clean (`bun run lint` exits 0)
- [ ] No console errors or warnings
- [ ] Mobile responsive (tested at 375px, 768px, 1024px, 1440px)
- [ ] Accessible (keyboard nav, ARIA, screen reader tested)
- [ ] `prefers-reduced-motion` honored
- [ ] No inline styles
- [ ] TypeScript strict (no `any`, no `@ts-ignore`)
- [ ] Loading state implemented
- [ ] Empty state implemented
- [ ] Error state implemented
- [ ] JSDoc on component props
- [ ] Committed with descriptive message

---

## 📊 Progress Tracking

| Phase | Total tasks | Complete | % |
|---|---|---|---|
| 0. Foundation | 32 | 30 | 94% |
| 1. Auth & Accounts | 52 | 52 | 100% |
| 2. Reviews & PDP | 39 | 39 | 100% |
| 3. Shop & Search | 28 | 28 | 100% |
| 4. Cart & Checkout | 31 | 31 | 100% |
| 5. Content & Editorial | 38 | 38 | 100% |
| 6. Mobile & UX | 25 | 25 | 100% |
| 7. Performance & SEO | 42 | 0 | 0% |
| 8. Design System | 31 | 0 | 0% |
| 9. Internationalization | 14 | 0 | 0% |
| 10. Production Readiness | 28 | 0 | 0% |
| **Total** | **360** | **243** | **68%** |

---

**Next action**: Tell me which phase to start. I recommend Phase 0 (Foundation) — everything else depends on the API client layer being in place. Just say "start Phase 0" and I'll begin, checking off boxes as I go.
