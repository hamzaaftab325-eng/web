#!/usr/bin/env python3
"""
Perfect Aura Living logo — SOLID COLORS, no gradients.

User feedback: 'gradient is not looking good'
Solution: use solid colors only. Premium brands use solid colors
(Aesop=brown, Chanel=black, Hermès=orange). Gradients look dated.

Build:
1. logo-light.svg  — solid WHITE text + white-outlined icon (for dark backgrounds)
2. logo-dark.svg   — solid CHARCOAL text + dark-outlined icon (for light backgrounds)
3. logo-gold.svg   — solid GOLD text + dark-outlined icon (for accents/special)

No gradients. No rendering issues. No halo. 100% consistent.
"""
import base64
import os
from PIL import Image
import numpy as np

ICON_SOURCE = "/home/z/my-project/public/icons/aura-icon.png"

# ============================================================
# Step 1: Generate clean icon variants (no over-processing)
# ============================================================
print("Step 1: Generating clean icon variants...")

img = Image.open(ICON_SOURCE).convert("RGBA")
arr = np.array(img)

# Remove ONLY pure white background (preserve all icon colors)
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
pure_white = (r > 240) & (g > 240) & (b > 240)
arr[pure_white, 3] = 0

# Dark-outlined icon (for light backgrounds) — just save as-is
Image.fromarray(arr).save("/home/z/my-project/public/icons/aura-icon-dark.png", "PNG", optimize=True)
print("  ✓ aura-icon-dark.png (dark outlines, for light backgrounds)")

# White-outlined icon (for dark backgrounds) — convert dark pixels to white
arr_light = arr.copy()
dark_mask = (r < 100) & (g < 100) & (b < 100)
arr_light[dark_mask, 0] = 255
arr_light[dark_mask, 1] = 255
arr_light[dark_mask, 2] = 255
Image.fromarray(arr_light).save("/home/z/my-project/public/icons/aura-icon-light.png", "PNG", optimize=True)
print("  ✓ aura-icon-light.png (white outlines, for dark backgrounds)")

# Encode both
with open("/home/z/my-project/public/icons/aura-icon-dark.png", "rb") as f:
    icon_dark_b64 = base64.b64encode(f.read()).decode("ascii")
with open("/home/z/my-project/public/icons/aura-icon-light.png", "rb") as f:
    icon_light_b64 = base64.b64encode(f.read()).decode("ascii")


# ============================================================
# Step 2: Build 3 SOLID-COLOR logo versions
# ============================================================
print("\nStep 2: Building solid-color logo SVGs...")

def build_logo(icon_b64, text_color):
    """Build a simple, solid-color logo. No gradients."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 480 100" width="480" height="100">
  <image x="10" y="14" width="72" height="72"
         xlink:href="data:image/png;base64,{icon_b64}"
         preserveAspectRatio="xMidYMid meet"/>
  <text x="92" y="64"
        font-family="Montserrat, Helvetica, Arial, sans-serif"
        font-size="36" font-weight="800"
        fill="{text_color}"
        letter-spacing="3">AURA LIVING</text>
</svg>'''


# 1. LOGO-LIGHT: solid white text + white-outlined icon (for dark backgrounds)
with open("/home/z/my-project/public/logo-light.svg", "w") as f:
    f.write(build_logo(icon_light_b64, "#FFFFFF"))
print("  ✓ logo-light.svg (solid white, for dark backgrounds)")

# 2. LOGO-DARK: solid charcoal text + dark-outlined icon (for light backgrounds)
with open("/home/z/my-project/public/logo-dark.svg", "w") as f:
    f.write(build_logo(icon_dark_b64, "#1A1714"))
print("  ✓ logo-dark.svg (solid charcoal, for light backgrounds)")

# 3. LOGO-GOLD: solid gold text + dark-outlined icon (for accents)
with open("/home/z/my-project/public/logo-gold.svg", "w") as f:
    f.write(build_logo(icon_dark_b64, "#B8901F"))
print("  ✓ logo-gold.svg (solid gold, for accents)")

# Also keep logo.svg and logo-white.svg as aliases for backward compat
import shutil
shutil.copy("/home/z/my-project/public/logo-dark.svg", "/home/z/my-project/public/logo.svg")
shutil.copy("/home/z/my-project/public/logo-light.svg", "/home/z/my-project/public/logo-white.svg")
shutil.copy("/home/z/my-project/public/logo-light.svg", "/home/z/my-project/public/logo-gradient.svg")
print("\n  ✓ Aliases: logo.svg, logo-white.svg, logo-gradient.svg (backward compat)")

print("\n✓ Perfect logo set complete!")
print("  - NO gradients (solid colors only)")
print("  - 3 distinct versions: white (dark bg), charcoal (light bg), gold (accents)")
print("  - Icon outlines swap: white on dark, dark on light")
print("  - 100% consistent, no rendering issues")
