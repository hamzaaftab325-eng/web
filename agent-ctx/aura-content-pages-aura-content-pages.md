# Task: aura-content-pages — 9 Content Page Files for Aura Living

## Agent
aura-content-pages (single agent, no subagents needed — all 9 files are
tightly coupled view components sharing one design system).

## Scope
Rewrote 9 content page files under `src/components/aura/sections/` for the
Aura Living e-commerce Next.js 16 + Tailwind 4 project, warm cream/gold
palette.

## Files written
1. `LookbookView.tsx` — 6 room-scene grid + Shop-the-Look hotspot detail
   with gold dots → product popover (image+name+price+Add). Back button.
2. `CollectionsView.tsx` — 3 large split-layout cards, gold-deep "Explore"
   link with ArrowRight → setCollection(slug).
3. `ArtisansView.tsx` — 4 workshop profile cards → full profile with story,
   4-image gallery, linked products. Back button.
4. `SustainabilityView.tsx` — 6-row sourcing table (material→source→
   workshop→certification with Check icon), 4 commitment cards, CTA.
5. `TradeView.tsx` — 6 benefit cards, 3-step form (Business→Contact→
   References) with progress indicator, success state with checkmark.
6. `GiftsView.tsx` — recipient chips + price chips, dark gift card CTA
   banner (`bg-gradient-to-br from-ink to-ink-soft`), filtered grid.
7. `CareView.tsx` — 7 care guide cards → full article with body blocks.
   Back button + ornamental divider.
8. `PressSection.tsx` — 5 publication cards (AD, Vogue Living, Kinfolk,
   Dwell, Apartment Therapy) with hover → dark popover quote. Plus 1
   press-outreach CTA card to balance the 3-col grid.
9. `JournalReader.tsx` — full-screen overlay reader reading
   `activeArticleSlug` from useUIStore. Hero image, author byline,
   body blocks, ornamental divider. Esc to close + useFocusTrap.

## Cross-cutting decisions
- Added `--color-hairline`, `--color-hairline-strong`, `--color-hairline-gold`,
  `--color-hairline-cream` tokens to the `@theme inline` block in
  `src/app/globals.css` so `border-hairline-cream`, `ring-hairline-cream`,
  `ring-hairline-gold`, `divide-hairline-cream`, `bg-hairline-gold`,
  `border-hairline` utilities resolve in Tailwind 4. Without these tokens
  the hairline-* classes silently produced no styles.
- All 9 files use `"use client"` and import `cn` from `@/lib/utils`.
- ZERO inline styles. LookbookView hotspot positions resolve through a
  literal Tailwind arbitrary-value class lookup (`POS_X` / `POS_Y` maps)
  so the JIT scanner emits `left-[30%]`, `top-[45%]`, etc. — no
  `style={{ left, top }}` anywhere.
- Root wrapper on all page views:
  `bg-gradient-to-b from-canvas to-cream/20 pt-[72px] md:pt-[88px] min-h-screen`.
- Section header pattern (per spec):
  `<p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
     <span className="w-6 h-px bg-gold" aria-hidden />Label
   </p>`
- Cards: `bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern`.
- Image cards use `ring-1 ring-hairline-cream group-hover:ring-hairline-gold`.
- Hero sections include a `bg-gold-pale opacity-60 blur-3xl` orb.
- Hover text colour is `hover:c-gold-deep` (links, icons, labels).
- Imports restricted to the canonical set the user specified:
  `useUIStore`, `motion` (+`AnimatePresence`), `TextBlurReveal`,
  `RevealOnScroll`, `ProductCard`, `cn`+`formatPrice`. Data imports use
  only the named exports the user listed (`lookbookScenes`+`lookbookBySlug`,
  `artisans`+`artisanBySlug`, `careGuides`+`careGuideBySlug`, `collections`,
  `products`). `productBySlug` is defined as a local helper from `products`
  in files that need slug lookups, so the `@/data/products` import stays
  as just `products`.
- JournalReader additionally imports `articleBySlug` + `JournalBodyBlock`
  type from `@/data/journal` (required for the reader to function) and
  `useFocusTrap` from `@/hooks/use-focus-trap` (explicitly requested).

## Data shape fixes applied during rewrite
- Old `LookbookView` imported non-existent `lookbookSceneBySlug` and
  referenced `scene.palette` / `hotspot.label` which don't exist in the
  data file. Rewrote to use `lookbookBySlug` and the actual `LookbookScene`
  / `LookbookHotspot` shapes.
- Old `ArtisansView` treated `artisan.story` as an array; the data file
  declares it as a single string. Added a `storyParagraphs()` helper that
  splits the string at sentence boundaries into ~2 paragraphs for the
  editorial lead+body rhythm.
- Old `CareView` imported non-existent `CareGuideBlock` export. Defined
  it locally as `CareGuide["body"][number]`.

## Verification
- `bun run lint` → clean, no errors.
- `curl http://localhost:3000/` → 200 (home compiles and renders).
- dev.log: latest entries are `GET / 200`; the prior 500s were from the
  broken pre-rewrite `lookbookSceneBySlug` import and are now resolved.

## Notes for downstream agents
- The globals.css token additions are load-bearing for ALL aura section
  files (existing and new) that use `border-hairline-cream`,
  `ring-hairline-gold`, `divide-hairline-cream`, `bg-hairline-gold`,
  or `border-hairline` classes. Do not remove those tokens.
- `productBySlug` is now a local helper in LookbookView, ArtisansView,
  and JournalReader (not imported). If you need it elsewhere, either
  import the real export from `@/data/products` or replicate the helper.
