# RULES.md — Absolute Constraints for Aura Living

> These rules are NON-NEGOTIABLE. Violating any is a critical error.

## 1. ZERO Inline Styles
- No `style={{}}` or `style="..."` in any JSX.
- For dynamic values: use CSS custom properties via `ref` + `useEffect`.
- For static values: create a utility class in `globals.css`.
- For Framer Motion: use `animate`, `initial`, `whileHover` — never `style`.

## 2. Don't Go Outside the Design System
- Do NOT create new CSS classes or tokens without asking the user first.
- Use only existing classes from `globals.css`.

## 3. Zero `any` Types
- Use `unknown` and narrow, or define a proper interface.

## 4. Zero `console.log` in Production Code
- `console.warn` and `console.error` are allowed.

## 5. Zero `@ts-ignore` / `eslint-disable` Without Justification

## 6. No Prototypes or Stubs
- Every component must be production-grade.

## 7. Warm Cream & Gold Palette
- Canvas: `#FAF7F0`, Gold: `#D4AF37`
- All cards: `bg-gradient-card-warm` with `border-hairline-cream`
- All hover states: `c-gold-deep`
- Header: white text over dark hero, dark text on scroll/account pages

## 8. Verify Before Declaring Complete
1. `rg 'style=\{\{' src/components/aura/` → 0 matches
2. `npx tsc --noEmit` → 0 errors in `src/`
3. `bun run lint` → 0 errors
4. No `console.log`, no `TODO`, no `any`
5. Commit to git after every change
