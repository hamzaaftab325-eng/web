# Aura Living — Principal Engineer Code Review Plan

> **Status**: Awaiting file-by-file review guidance
> **Project**: Aura Living (Next.js 15 + Prisma + Supabase + Tailwind v4)
> **Repo**: `https://github.com/hamzaoftab325-eng/web`
> **Branch**: main (Vercel auto-deploy)

---

## Review Methodology

Each file review follows this structure:

### 1. File Metadata
- **Path**: Full file path
- **Lines**: Total line count
- **Role**: Component / API Route / Hook / Store / Config

### 2. Score (0–10)
| Score | Meaning |
|-------|---------|
| 10/10 | Production-grade, zero issues |
| 9/10  | Minor nitpick(s) only |
| 8/10  | 1–2 medium issues |
| 7/10  | Several medium issues or 1 high issue |
| 6/10  | High issues present |
| ≤5    | Critical issues, needs rewrite |

### 3. Issue Severity Levels
| Severity | Definition |
|----------|-----------|
| **Critical** | Security vulnerability, data loss risk, runtime crash in production |
| **High** | Logic bug, race condition, missing error handling, accessibility blocker |
| **Medium** | Performance concern, inconsistent patterns, missing aria-label, magic numbers |
| **Low** | Style nitpick, naming suggestion, optional enhancement |

### 4. Review Dimensions (per file)
1. **Correctness** — Does it do what it claims? Edge cases?
2. **Security** — Auth checks, input validation, SQL injection, XSS
3. **Performance** — Unnecessary re-renders, missing memoization, bundle size
4. **Accessibility** — ARIA roles, keyboard nav, focus trap, reduced motion
5. **Pattern Consistency** — Matches project conventions (design tokens, component patterns)
6. **Type Safety** — Proper TypeScript types, no `any`, no type assertions
7. **Error Handling** — Graceful degradation, user feedback, no silent failures
8. **Code Hygiene** — No unused imports, no dead code, no inline styles in components

---

## Completed Reviews

### Session 1 — Flash Sale Feature (2026-07-07)

#### Files Modified
| File | Score | Notes |
|------|-------|-------|
| `prisma/schema.prisma` (FlashSale model) | 10/10 | Added `maxUses`, `usesCount`, `updatedAt` |
| `src/app/api/admin/flash-sales/route.ts` | 9/10 | Zod validation, promo code regex, date cross-validation |
| `src/app/api/admin/flash-sales/[id]/route.ts` | 9/10 | 404 check, 409 conflict for limit-reached, resetUsesCount |
| `src/app/api/content/flash-sales/route.ts` | 10/10 | Public endpoint, returns maxUses/usesCount |
| `src/app/globals.css` (new utility classes) | 10/10 | Flash banner, wishlist drawer, admin usage bar — zero inline styles |
| `src/components/aura/sections/FlashSaleBanner.tsx` | 10/10 | NEW — premium dark banner, split-digit countdown, copy promo, CSS classes only |
| `src/components/aura/commerce/WishlistDrawer.tsx` | 10/10 | Enhanced — sale badges, sold-out overlay, cart feedback, cleaned timer |
| `src/app/admin/flash-sales/page.tsx` | 10/10 | Rewritten — matches promo-codes pattern, usage bar, status badges, toasts |

#### Issues Found & Fixed
- **FlashSaleBanner** (was 6.5/10 → 10/10):
  - ✅ Removed all inline styles (was `style={{...}}` everywhere)
  - ✅ Replaced `document.execCommand('copy')` with `navigator.clipboard.writeText`
  - ✅ Added proper error handling (was silently swallowing errors)
  - ✅ Removed 3 unused imports
  - ✅ Added `useCallback` for `copyCode` to avoid re-renders
  - ✅ Added `useRef` for timer + proper cleanup on unmount
  - ✅ Replaced magic numbers with CSS custom properties
  - ✅ Added `aria-label` on all interactive elements

- **WishlistDrawer** (was 8.5/10 → 10/10):
  - ✅ Fixed `setTimeout` not cleaned up on unmount (was high issue)
  - ✅ Added explicit `WishlistProduct` type (was using `typeof product` causing type drift risk)
  - ✅ Added `aria-label` on remove buttons
  - ✅ Added sale badge, sold-out overlay, price comparison, cart feedback
  - ✅ Added footer with in-stock/on-sale counts
  - ✅ Added clear all with confirmation
  - ✅ Matches CartDrawer pattern exactly (overlay, drag handle, header, empty state)

- **Flash Sales Admin** (was basic → 10/10):
  - ✅ Matches promo-codes page pattern exactly (header, form, list, empty state, loading)
  - ✅ Added Customer Limit field with proper validation
  - ✅ Added usage progress bar (green→amber→red)
  - ✅ Added 5 status states (live/scheduled/expired/exhausted/draft)
  - ✅ Added warning banner at 75%+ usage
  - ✅ Added exhausted banner with 1-click reset
  - ✅ Added toast notifications
  - ✅ Added two-click delete (confirm dialog)
  - ✅ Removed all inline styles, uses design system classes only
  - ✅ No duplicate className (fixed the reported issue)

---

## Pending Reviews

_Awaiting guidance on which files to review next._

### Suggested Priority Files
1. `src/app/api/orders/route.ts` — Flash sale integration in order flow
2. `src/app/api/content/promo-codes/[code]/route.ts` — FlashSale fallback
3. `src/middleware.ts` — Auth/security
4. `src/lib/auth.ts` — Dual JWT (jose + jsonwebtoken)
5. `src/store/use-cart-store.ts` — Cart stock limit logic
6. `src/components/aura/layout/Header.tsx` — FlashSaleBanner integration
7. `src/app/page.tsx` — Homepage (FlashSaleBanner placement)

### Deferred Tasks
- [ ] Delete 11 unused Prisma models + associated code
- [ ] Enhance BrandValue model with `icon` field
- [ ] Generate SQL DROP statements for Supabase
- [ ] Fix dashboard notifications not showing
- [ ] Run migration SQL in Supabase (maxUses/usesCount columns)

---

## Design System Reference

### Tokens Used
- Colors: `c-ink`, `c-ink-muted`, `c-ink-faint`, `c-gold`, `c-gold-deep`, `c-gold-pale`, `c-paper`, `c-cream`, `c-cream-deep`, `c-error`, `c-success`, `c-warning`, `c-info`
- Typography: `t-display-md`, `t-headline-sm`, `t-body`, `t-body-sm`, `t-caption`, `t-label-caps`, `t-num`
- Layout: `container-aura`, `section-stack`, `bg-canvas`, `bg-paper`, `bg-cream`
- Shadows: `shadow-premium`, `shadow-gold-glow`, `shadow-card-modern`
- Borders: `border-hairline`, `border-hairline-cream`, `border-hairline-gold`
- Components: `chip`, `badge`, `aura-loader-ring`, `scrollbar-thin`, `overlay-dark`, `bg-gradient-card-warm`
- Buttons: `btn-hover-spacing`, `btn-hover-underline-arrow`, `btn-hover-icon-reveal`
- Cards: `card-modern`, `card-warm`, `glass-card`
- Interactions: `tap-feedback`, `hover-lift`, `link-underline`, `focus-ring`

### Canonical Admin Page Pattern (promo-codes)
```
1. Page header: absolute gradient orb + TextBlurReveal h1 + t-label-caps section tag + Add button
2. Form: motion.div slide-in, bg-gradient-card-warm, grid grid-cols-2, inputCls constant
3. List: RevealOnScroll stagger, motion.div cards with chip badges
4. Empty: icon + headline + description + CTA button
5. Loading: aura-loader-ring
6. Actions: Activate/Deactivate button + Delete button (same pattern as promo-codes)
```

### Canonical Drawer Pattern (CartDrawer)
```
1. AnimatePresence + overlay-dark
2. motion.aside with drag, dragConstraints, dragElastic, onDragEnd
3. Drag handle (left edge, 3px gold bar)
4. Header: icon + title + count + close button (h-[72px], px-6)
5. Empty state: rounded-full icon container + headline + description + CTA
6. Items: scrollbar-thin, AnimatePresence, motion.div with layout animation
7. Focus trap via useFocusTrap
8. Reduced motion support via useReducedMotion
```