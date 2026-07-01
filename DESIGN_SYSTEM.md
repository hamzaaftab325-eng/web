# Aura Living — Design System Reference

## Color Tokens

### Light Mode (default)
| Token | Value | Usage |
|---|---|---|
| `--canvas` | #FAF7F0 | Page background |
| `--paper` | #FFFFFF | Card/surface background |
| `--cream` | #FDFBF7 | Subtle background |
| `--cream-deep` | #F5EFE1 | Elevated background |
| `--ink` | #1A1714 | Primary text |
| `--ink-muted` | #6B5D4F | Secondary text |
| `--ink-faint` | #9B8D7A | Tertiary text |
| `--gold` | #D4AF37 | Accent |
| `--gold-deep` | #B8901F | Hover states |
| `--gold-pale` | #FAF0D4 | Accent backgrounds |
| `--error` | #8B2A26 | Error states |
| `--success` | #5A7D52 | Success states |

### Dark Mode (`[data-theme="dark"]`)
All tokens invert. Gold stays the same. See `globals.css` for full values.

## Type Scale

| Class | Size (clamp) | Usage |
|---|---|---|
| `t-display-xl` | 44px → 80px | Hero headings |
| `t-display-lg` | 40px → 64px | Page heroes |
| `t-display-md` | 32px → 48px | Section headers |
| `t-display-sm` | 28px → 40px | Stat numbers |
| `t-headline-lg` | 28px → 40px | Card titles |
| `t-headline-md` | 24px → 32px | Subsection headers |
| `t-headline-sm` | 20px → 24px | Small headings |
| `t-body-lg` | 17px → 18px | Lead paragraphs |
| `t-body` | 15px → 16px | Body text |
| `t-body-sm` | 14px | Small text |
| `t-caption` | 12px | Captions |
| `t-label-caps` | 11px | Eyebrow labels (uppercase) |

## Component Patterns

### Section Header (consistent across all pages)
```jsx
<p className="t-label-caps c-gold-deep mb-3 flex items-center gap-2">
  <span className="w-6 h-px bg-gold" aria-hidden />
  Eyebrow Label
</p>
<h2 className="t-display-md c-ink leading-tight mb-4">Section Heading</h2>
```

### CTA Button (consistent across all pages)
```jsx
<button className="inline-flex items-center gap-3 bg-ink c-paper t-label-caps px-6 py-3.5 hover:bg-gold-deep transition-colors rounded-sm">
  Button Text
  <ArrowRight size={14} strokeWidth={1.5} />
</button>
```

### Card (consistent across all pages)
```jsx
<div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6">
  Content
</div>
```

## Accessibility Modes

### High Contrast (`[data-contrast="high"]`)
- Stronger borders (0.4–0.6 opacity)
- Pure black/white text

### Font Size Scaler (`[data-font-size="sm|md|lg"]`)
- `sm`: scales all type down ~20%
- `lg`: scales all type up ~20%

## Motion Specs

| Token | Value | Usage |
|---|---|---|
| `--t-fast` | 150ms ease | Hover states |
| `--t-base` | 300ms ease | Standard transitions |
| `--t-smooth` | 500ms cubic-bezier(0.16, 1, 0.3, 1) | Page transitions |
| `--t-spring` | 500ms cubic-bezier(0.34, 1.56, 0.64, 1) | Bounce animations |

All animations honor `prefers-reduced-motion`.

## Z-Index Scale

| Class | Value | Usage |
|---|---|---|
| `z-sticky` | 100 | Header, MobileTabBar |
| `z-overlay` | 500 | Overlay backdrops |
| `z-drawer` | 600 | Cart/Wishlist/Nav drawers |
| `z-modal` | 1000 | Modals, popups |
| `z-modal-elevated` | 1100 | Elevated modals |
| `z-toast` | 1200 | Toast notifications |
| `z-tooltip` | 1400 | Tooltips |
