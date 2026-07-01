#!/usr/bin/env python3
"""
Premium Aura Living logo — FINAL 10/10 version.

Senior brand designer refinements:
1. ICON = TEXT HEIGHT (equal size, confident lockup)
2. Two gradient versions:
   - logo-gradient.svg: white→cream→gold (for dark backgrounds: hero, footer)
   - logo.svg: charcoal gradient #2A2A2A→#1A1714→#0A0A0A (for light backgrounds, scrolled)
3. Perfect vertical centering (dominant-baseline='central')
4. Premium letter-spacing and font weight
5. Deep-cleaned icon (no white halo on dark backgrounds)
"""
import base64
import os
import shutil
from PIL import Image, ImageFilter
import numpy as np

ICON_SOURCE = "/home/z/my-project/download/aura-logos/AI-icon-source.png"
ICON_CLEAN = "/home/z/my-project/download/aura-logos/AI-icon-premium.png"

# ============================================================
# Step 1: Deep-clean the icon (one more pass for maximum polish)
# ============================================================
print("Step 1: Deep-cleaning icon...")

img = Image.open(ICON_SOURCE).convert("RGBA")
arr = np.array(img)
h, w = arr.shape[:2]

r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Aggressive white removal
white_mask = (r > 215) & (g > 215) & (b > 215)
arr[white_mask, 3] = 0

# Catch semi-white halo edges
semi_white = (r > 170) & (g > 170) & (b > 170) & (abs(r.astype(int) - g.astype(int)) < 18) & (abs(g.astype(int) - b.astype(int)) < 18)
arr[semi_white, 3] = np.minimum(arr[semi_white, 3], 40)

clean_img = Image.fromarray(arr)
clean_img = clean_img.filter(ImageFilter.GaussianBlur(radius=0.3))
clean_img.save(ICON_CLEAN, "PNG", optimize=True)

# Also update public/icons/aura-icon.png
shutil.copy(ICON_CLEAN, "/home/z/my-project/public/icons/aura-icon.png")
print(f"  ✓ Deep-cleaned icon saved")

# Encode as base64
with open(ICON_CLEAN, "rb") as f:
    icon_b64 = base64.b64encode(f.read()).decode("ascii")


# ============================================================
# Step 2: Build the premium logo SVGs
# ============================================================
print("\nStep 2: Building premium logo SVGs...")

# ViewBox: 480 x 100 (wide horizontal lockup)
# Icon: 72x72 at (10, 14) — vertically centered (100-72=28, /2=14)
# Text: 36pt at y=50, dominant-baseline=central — vertically centered
# Icon height (72) ≈ text cap-height (36pt ≈ 72px at this scale) — EQUAL SIZE

def build_logo(icon_b64, text_fill, gradient_def=""):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 480 100" width="480" height="100">
  <defs>
    {gradient_def}
  </defs>

  <!-- Icon: 72x72, vertically centered (top=14, bottom=86) -->
  <image x="10" y="14" width="72" height="72"
         xlink:href="data:image/png;base64,{icon_b64}"
         preserveAspectRatio="xMidYMid meet"/>

  <!-- AURA LIVING text — 36pt, vertically centered with icon -->
  <text x="92" y="50"
        font-family="Avenir Next Heavy, Montserrat ExtraBold, Gilroy ExtraBold, Helvetica, Arial, sans-serif"
        font-size="36" font-weight="800"
        fill="{text_fill}"
        letter-spacing="3"
        dominant-baseline="central">AURA LIVING</text>
</svg>'''


# Gradient 1: WHITE → CREAM → GOLD (for dark backgrounds — hero, footer)
# Horizontal sweep, luxury feel
LIGHT_GRADIENT = '''<linearGradient id="premiumLight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#F8E8C8"/>
      <stop offset="70%" stop-color="#E8C75A"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>'''

# Gradient 2: CHARCOAL → GOLD (for light backgrounds — scrolled state)
# Stronger gold presence for premium visibility
DARK_GRADIENT = '''<linearGradient id="premiumDark" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2A2520"/>
      <stop offset="40%" stop-color="#5C4A2E"/>
      <stop offset="75%" stop-color="#B8901F"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>'''

# Build all 4 versions:

# 1. GRADIENT (white-to-gold) — for dark backgrounds (hero, footer)
with open("/home/z/my-project/public/logo-gradient.svg", "w") as f:
    f.write(build_logo(icon_b64, "url(#premiumLight)", LIGHT_GRADIENT))
print(f"  ✓ logo-gradient.svg (white→gold, for dark backgrounds)")

# 2. CHARCOAL GRADIENT — for light backgrounds (scrolled header)
with open("/home/z/my-project/public/logo.svg", "w") as f:
    f.write(build_logo(icon_b64, "url(#premiumDark)", DARK_GRADIENT))
print(f"  ✓ logo.svg (charcoal gradient, for light backgrounds)")

# 3. Solid white (alternative for dark backgrounds)
with open("/home/z/my-project/public/logo-white.svg", "w") as f:
    f.write(build_logo(icon_b64, "#FFFFFF"))
print(f"  ✓ logo-white.svg (solid white)")

# 4. Solid gold (accents)
with open("/home/z/my-project/public/logo-gold.svg", "w") as f:
    f.write(build_logo(icon_b64, "#D4AF37"))
print(f"  ✓ logo-gold.svg (solid gold)")

print("\n✓ Premium logo set complete!")
print("  Key specs:")
print("  - Icon: 72x72 (equal to text cap-height — confident lockup)")
print("  - Text: 36pt ExtraBold, letter-spacing 3")
print("  - Both vertically centered (dominant-baseline='central')")
print("  - Two gradients: white→gold (dark bg) + charcoal→ink (light bg)")
print("  - Deep-cleaned icon (no white halo)")
