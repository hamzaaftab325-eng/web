#!/usr/bin/env python3
"""
Build ALL logo variants needed for the full theme system:

1. logo-gradient.svg — white→gold gradient (dark hero, not scrolled)
2. logo.svg — charcoal→gold gradient (light backgrounds, scrolled)
3. logo-dark.svg — solid charcoal (for light footer in dark mode)
4. logo-white.svg — solid white (alternative for dark backgrounds)

PLUS: Generate icon variants with WHITE outlines (for dark backgrounds)
and BLACK outlines (for light backgrounds) so the icon is always visible.
"""
import base64
import os
from PIL import Image, ImageOps
import numpy as np

ICON_SOURCE = "/home/z/my-project/public/icons/aura-icon.png"

# ============================================================
# Step 1: Generate icon variants
# ============================================================
print("Step 1: Generating icon variants...")

# Original icon (with dark outlines)
img = Image.open(ICON_SOURCE).convert("RGBA")
arr = np.array(img)

# Save original as icon-dark (for light backgrounds)
img.save("/home/z/my-project/public/icons/aura-icon-dark.png", "PNG", optimize=True)
print("  ✓ aura-icon-dark.png (dark outlines, for light backgrounds)")

# Create white-outlined version for dark backgrounds
# Strategy: invert the RGB channels (but keep alpha)
# This turns black outlines → white, yellow → blue-ish, etc.
# Then we need to fix the colors back to original palette but with white outlines.

# Actually, simpler approach: create a version where dark pixels become white
arr_white = arr.copy()
r, g, b = arr_white[:,:,0], arr_white[:,:,1], arr_white[:,:,2]
alpha = arr_white[:,:,3]

# Find dark pixels (the outlines) — R<100, G<100, B<100
dark_mask = (r < 100) & (g < 100) & (b < 100)
# Make these white
arr_white[dark_mask, 0] = 255
arr_white[dark_mask, 1] = 255
arr_white[dark_mask, 2] = 255

# Find the yellow pixels and keep them
# Find beige pixels and keep them
# (no change needed — only outlines are dark)

Image.fromarray(arr_white).save("/home/z/my-project/public/icons/aura-icon-light.png", "PNG", optimize=True)
print("  ✓ aura-icon-light.png (white outlines, for dark backgrounds)")

# ============================================================
# Step 2: Build all logo SVG variants
# ============================================================
print("\nStep 2: Building logo SVGs...")

# Encode both icon variants
with open("/home/z/my-project/public/icons/aura-icon-dark.png", "rb") as f:
    icon_dark_b64 = base64.b64encode(f.read()).decode("ascii")
with open("/home/z/my-project/public/icons/aura-icon-light.png", "rb") as f:
    icon_light_b64 = base64.b64encode(f.read()).decode("ascii")


def build_logo(icon_b64, text_fill, gradient_id=None, gradient_stops=None):
    """Build a logo SVG."""
    defs = ""
    fill = text_fill

    if gradient_stops:
        stops_xml = ""
        for offset, color in gradient_stops:
            stops_xml += f'\n      <stop offset="{offset}" stop-color="{color}"/>'
        defs = f'<linearGradient id="{gradient_id}" x1="0" y1="0" x2="1" y2="0">{stops_xml}\n    </linearGradient>'
        fill = f"url(#{gradient_id})"

    return f'''<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 480 100" width="480" height="100">
  <defs>
    {defs}
  </defs>
  <image x="10" y="14" width="72" height="72"
         xlink:href="data:image/png;base64,{icon_b64}"
         preserveAspectRatio="xMidYMid meet"/>
  <text x="92" y="64"
        font-family="Montserrat, Helvetica, Arial, sans-serif"
        font-size="36" font-weight="800"
        fill="{fill}"
        letter-spacing="3">AURA LIVING</text>
</svg>'''


# Gradients
white_gold = [
    ("0%", "#FFFFFF"),
    ("50%", "#F5DC92"),
    ("100%", "#D4AF37"),
]
dark_gold = [
    ("0%", "#1A1714"),
    ("60%", "#6B5530"),
    ("100%", "#B8901F"),
]

# 1. logo-gradient.svg — white→gold gradient + WHITE-outlined icon (for dark hero)
with open("/home/z/my-project/public/logo-gradient.svg", "w") as f:
    f.write(build_logo(icon_light_b64, None, "gradLight", white_gold))
print("  ✓ logo-gradient.svg (white→gold, white icon outlines, for dark backgrounds)")

# 2. logo.svg — charcoal→gold gradient + DARK-outlined icon (for light scrolled)
with open("/home/z/my-project/public/logo.svg", "w") as f:
    f.write(build_logo(icon_dark_b64, None, "gradDark", dark_gold))
print("  ✓ logo.svg (charcoal→gold, dark icon outlines, for light backgrounds)")

# 3. logo-dark.svg — solid charcoal + dark icon (for light footer in dark mode)
with open("/home/z/my-project/public/logo-dark.svg", "w") as f:
    f.write(build_logo(icon_dark_b64, "#1A1714"))
print("  ✓ logo-dark.svg (solid charcoal, for light footer in dark mode)")

# 4. logo-white.svg — solid white + white icon (for dark backgrounds, alternative)
with open("/home/z/my-project/public/logo-white.svg", "w") as f:
    f.write(build_logo(icon_light_b64, "#FFFFFF"))
print("  ✓ logo-white.svg (solid white, white icon outlines)")

# 5. logo-gold.svg — solid gold (accent)
with open("/home/z/my-project/public/logo-gold.svg", "w") as f:
    f.write(build_logo(icon_dark_b64, "#D4AF37"))
print("  ✓ logo-gold.svg (solid gold)")

print("\n✓ All logo variants built!")
print("  Icon variants: aura-icon-dark.png (light bg), aura-icon-light.png (dark bg)")
print("  Logo variants: 5 versions covering all theme scenarios")
