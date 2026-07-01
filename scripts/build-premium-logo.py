#!/usr/bin/env python3
"""
Build the premium Aura Living logo with WHITE-GOLD GRADIENT text.
- Text: white-to-gold vertical gradient (luxury feel)
- Icon: AI-generated transparent icon
- Larger proportions
- Three sizes: small (header mobile), medium (header desktop), large (footer)
"""
import base64
import os
from PIL import Image

ICON_PATH = "/home/z/my-project/download/aura-logos/AI-icon-transparent.png"

with open(ICON_PATH, "rb") as f:
    icon_bytes = f.read()
icon_b64 = base64.b64encode(icon_bytes).decode("ascii")

# ============================================================
# Build the GRADIENT SVG (white-to-gold text on transparent bg)
# Uses SVG <linearGradient> for the text fill
# ============================================================

def build_logo_svg(icon_b64, text_color="url(#goldGradient)", id_suffix=""):
    """Build a logo SVG with the given text color (or gradient ref)."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 480 100" width="480" height="100">
  <defs>
    <!-- White-to-gold vertical gradient (top = white, bottom = warm gold) -->
    <linearGradient id="goldGradient{id_suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="55%" stop-color="#F5E6C8"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>
  </defs>

  <!-- Icon (left, vertically centered, larger) -->
  <image x="5" y="10" width="80" height="80"
         xlink:href="data:image/png;base64,{icon_b64}"
         preserveAspectRatio="xMidYMid meet"/>

  <!-- AURA LIVING text with gradient fill -->
  <text x="100" y="62"
        font-family="Avenir Next Heavy, Montserrat ExtraBold, Gilroy ExtraBold, Helvetica, Arial, sans-serif"
        font-size="34" font-weight="800"
        fill="{text_color}"
        letter-spacing="4">AURA LIVING</text>
</svg>'''


# ============================================================
# Generate 3 versions:
# 1. Gradient (white-to-gold) — for dark backgrounds (footer)
# 2. Solid white — alternative for dark backgrounds
# 3. Solid charcoal — for light backgrounds (header when scrolled)
# 4. Solid ink-soft — for header on light pages
# ============================================================

print("Building premium logo SVGs with gradient...")

# 1. Gradient version (the showpiece — for footer + dark surfaces)
gradient_svg = build_logo_svg(icon_b64, "url(#goldGradient)")
with open("/home/z/my-project/public/logo-gradient.svg", "w") as f:
    f.write(gradient_svg)
print(f"  ✓ public/logo-gradient.svg ({os.path.getsize('/home/z/my-project/public/logo-gradient.svg')/1024:.1f} KB)")

# 2. Solid white version (for dark backgrounds, alternative)
white_svg = build_logo_svg(icon_b64, "#FFFFFF")
with open("/home/z/my-project/public/logo-white.svg", "w") as f:
    f.write(white_svg)
print(f"  ✓ public/logo-white.svg ({os.path.getsize('/home/z/my-project/public/logo-white.svg')/1024:.1f} KB)")

# 3. Solid charcoal version (for light backgrounds — header when scrolled)
dark_svg = build_logo_svg(icon_b64, "#1A1714")
with open("/home/z/my-project/public/logo.svg", "w") as f:
    f.write(dark_svg)
print(f"  ✓ public/logo.svg ({os.path.getsize('/home/z/my-project/public/logo.svg')/1024:.1f} KB)")

# 4. Gold-only version (for special accents)
gold_svg = build_logo_svg(icon_b64, "#D4AF37")
with open("/home/z/my-project/public/logo-gold.svg", "w") as f:
    f.write(gold_svg)
print(f"  ✓ public/logo-gold.svg ({os.path.getsize('/home/z/my-project/public/logo-gold.svg')/1024:.1f} KB)")

print("\n✓ All 4 logo versions generated:")
print("  public/logo.svg         — charcoal text (light backgrounds)")
print("  public/logo-white.svg   — solid white text (dark backgrounds)")
print("  public/logo-gradient.svg— white-to-gold gradient (premium, dark backgrounds)")
print("  public/logo-gold.svg    — solid gold text (accents)")
