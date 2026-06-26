---
name: Ethereal Dwelling
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1c1a'
  on-tertiary-container: '#848481'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e4e2de'
  tertiary-fixed-dim: '#c8c6c3'
  on-tertiary-fixed: '#1b1c1a'
  on-tertiary-fixed-variant: '#474744'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 32px
  margin-desktop: 64px
  margin-tablet: 32px
  margin-mobile: 20px
  stack-xl: 120px
  stack-md: 64px
---

## Brand & Style
The design system is centered on a luxury e-commerce experience that prioritizes editorial-grade presentation over high-density information. The target audience is discerning homeowners and interior designers who value craftsmanship and quiet luxury.

The style is **Refined Minimalism** with a **Glassmorphic** layer for navigation. It leverages extreme whitespace to allow product photography to serve as the primary visual driver. The emotional response should be one of "curated calm"—a frictionless, sophisticated shopping journey that feels more like browsing a high-end gallery than a traditional storefront.

## Colors
This design system utilizes a high-contrast, limited palette to maintain an air of exclusivity. 

- **Primary Background (#FFFFFF):** Used for the main canvas to ensure product images pop with clarity.
- **Secondary Background (#FDFBF7):** A soft cream used for section differentiation, hover states, and background containers to add warmth.
- **High-Contrast Text (#111111):** Deep black for maximum legibility and a classic editorial feel.
- **Accent Gold (#D4AF37):** Reserved strictly for primary calls-to-action, price highlights, and subtle interactive cues. Use sparingly to maintain its impact.

## Typography
The typographic scale emphasizes the contrast between the traditional elegance of **Playfair Display** and the functional clarity of **Inter**.

- **Display & Headlines:** Use Playfair Display for all emotional and structural headers. Ensure tight kerning for large display sizes to maintain a premium feel.
- **Body & Interface:** Use Inter for all product descriptions, UI labels, and navigational elements. 
- **The "Label-Caps" Role:** Use this specifically for categories, breadcrumbs, and small eyebrow text to introduce a structured, rhythmic feel to the layout.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to ensure a curated, "lookbook" appearance, transitioning to a fluid model for smaller viewports.

- **Desktop:** A 12-column grid with generous 32px gutters. Large vertical gaps (`stack-xl`) between sections are mandatory to allow the eyes to rest.
- **Alignment:** Product grids should favor asymmetrical layouts or large 1-2 column spans to mimic luxury editorial magazines.
- **Safe Zones:** Maintain a minimum 64px outer margin on desktop to frame the content like a piece of art.

## Elevation & Depth
Depth is expressed through transparency and soft, natural shadows rather than heavy borders.

- **Navigation:** The header utilizes a **Glassmorphic** effect—a backdrop-blur (20px) with 80% opacity white fill and a hairline bottom border (#111111 at 5% opacity).
- **Product Cards:** Cards are flush with the background until hovered or active, at which point they gain a "Soft Ambient" shadow: `0px 10px 30px rgba(0, 0, 0, 0.04)`.
- **Modals & Overlays:** Use a subtle cream-tinted overlay (#FDFBF7 at 40% opacity) for background dimming to keep the aesthetic warm.

## Shapes
The shape language is **Soft** but disciplined.

- **Primary Elements:** Buttons and input fields use a slight 0.25rem radius to soften the high-contrast black/white palette without appearing "bubbly" or juvenile.
- **Imagery:** Product photography should remain sharp (0px radius) to emphasize architectural precision and the quality of the home decor items.

## Components

### Buttons
- **Primary:** Solid Deep Black (#111111) with white Inter-medium text. High vertical padding, uppercase with tracking.
- **Secondary/CTA:** Elegant Gold (#D4AF37) used only for "Add to Cart" or "Buy Now" to guide the user's final decision.

### Product Cards
- Minimalist design: The image occupies 85% of the card. Text is left-aligned below. Use Playfair Display for the product name and Inter for the price. No borders; use a soft shadow on hover.

### Navigation
- **Top Bar:** Glassmorphic container. Use minimal line icons (1px stroke) for "Search," "Profile," and "Cart."
- **Hover States:** Subtle underlines (1px) for text links, using the Gold accent.

### Input Fields
- Underline-style inputs with no side borders. The label floats above the line in the "Label-Caps" typography style. Focus state changes the bottom border from light grey to Deep Black.

### Chips & Tags
- Used for material types (e.g., "Velvet," "Oak"). Small, pill-shaped with a Soft Cream (#FDFBF7) background and Deep Black text.