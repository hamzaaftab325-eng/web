# Aura Living — Accessibility Reference

## Features

### Keyboard Navigation
- **Skip link:** "Skip to content" (first focusable element)
- **Tab/Shift+Tab:** Navigate through interactive elements
- **Enter/Space:** Activate buttons/links
- **Escape:** Close any open overlay (drawers, modals, search)

### Keyboard Shortcuts (power users)
| Shortcut | Action |
|---|---|
| `/` | Open search |
| `g h` | Go home |
| `g s` | Go to shop |
| `g c` | Open cart |
| `g w` | Open wishlist |
| `g a` | Go to account |

*Shortcuts disabled when typing in inputs/textareas.*

### Focus States
- Gold outline (2px) + 2px offset on all interactive elements
- Visible on keyboard navigation only (`:focus-visible`)

### ARIA
- `aria-live="polite"` on cart count, search results
- `aria-live="assertive"` on form errors
- `role="dialog"` on modals
- `role="listbox"` on custom selects
- `aria-current="page"` on active nav items
- `aria-expanded` on dropdowns/accordions

### Screen Reader Support
- `.sr-only` class for visually hidden but screen-reader visible text
- `useAnnounce` hook for dynamic announcements
- Semantic HTML (`nav`, `main`, `section`, `article`, `footer`)
- Alt text on all images

### Display Preferences (gear icon in header)
- **Theme:** Light / Dark / System
- **Contrast:** Default / High
- **Text size:** Small / Medium / Large

All settings persist to localStorage and apply immediately via CSS custom properties.

### Reduced Motion
- All animations honor `prefers-reduced-motion: reduce`
- Framer Motion uses `useReducedMotion()` hook
- CSS animations have `@media (prefers-reduced-motion: reduce)` overrides
- Custom cursor disabled
- Page transitions reduced to opacity-only

### Color Contrast
- Body text: WCAG AAA (7:1) where possible
- Secondary text: WCAG AA (4.5:1) minimum
- Gold accent on cream: verified AA
- Dark mode: all text colors adjusted for contrast on dark backgrounds

### Read Aloud
- "Read aloud" button on product descriptions (Web Speech API)
- Falls back gracefully on unsupported browsers
- Play/stop toggle

## Tested With
- Chrome DevTools Accessibility panel
- axe-core (0 violations target)
- Keyboard-only navigation
- VoiceOver (macOS)
