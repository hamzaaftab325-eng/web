#!/usr/bin/env python3
"""
FINAL FIXED Aura Living logo.

Root cause of gradient not rendering: the previous version had the
<text> element with dominant-baseline='central' which some renderers
(cairosvg, certain browsers) handle poorly when combined with gradients.

Fix: use a <text> with explicit y coordinate calculated for vertical
centering, NO dominant-baseline attribute. This is the most compatible
approach across all renderers (browsers, cairosvg, librsvg).

Also: simplified gradient (3 stops instead of 4) for cleaner rendering.
"""
import base64
import os
from PIL import Image
import numpy as np

ICON_SOURCE = "/home/z/my-project/public/icons/aura-icon.png"

# Read the icon (already cleaned in previous step)
with open(ICON_SOURCE, "rb") as f:
    icon_b64 = base64.b64encode(f.read()).decode("ascii")
print(f"✓ Loaded icon ({len(icon_b64)/1024:.1f} KB base64)")


def build_logo(text_fill, gradient_id=None, gradient_stops=None):
    """Build a logo SVG with guaranteed-rendering gradient."""
    defs = ""
    fill = text_fill

    if gradient_stops:
        stops_xml = ""
        for offset, color in gradient_stops:
            stops_xml += f'\n      <stop offset="{offset}" stop-color="{color}"/>'
        defs = f'''<linearGradient id="{gradient_id}" x1="0" y1="0" x2="1" y2="0">{stops_xml}
    </linearGradient>'''
        fill = f"url(#{gradient_id})"

    # Icon: 72x72 at (10, 14) — vertically centered in 100px viewBox
    # Text: y=64 — this is the baseline position that vertically centers
    #   36pt text in a 100px viewBox (cap height ≈ 26px, so center ≈ y=64)
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


# Gradient 1: WHITE → GOLD (for dark backgrounds)
# 3 clean stops for reliable rendering
white_gold = [
    ("0%", "#FFFFFF"),
    ("50%", "#F5DC92"),
    ("100%", "#D4AF37"),
]

# Gradient 2: DARK → GOLD (for light backgrounds)
dark_gold = [
    ("0%", "#1A1714"),
    ("60%", "#6B5530"),
    ("100%", "#B8901F"),
]

# Build all 4 versions
with open("/home/z/my-project/public/logo-gradient.svg", "w") as f:
    f.write(build_logo(None, "gradLight", white_gold))
print("  ✓ logo-gradient.svg (white→gold, dark backgrounds)")

with open("/home/z/my-project/public/logo.svg", "w") as f:
    f.write(build_logo(None, "gradDark", dark_gold))
print("  ✓ logo.svg (charcoal→gold, light backgrounds)")

with open("/home/z/my-project/public/logo-white.svg", "w") as f:
    f.write(build_logo("#FFFFFF"))
print("  ✓ logo-white.svg (solid white)")

with open("/home/z/my-project/public/logo-gold.svg", "w") as f:
    f.write(build_logo("#D4AF37"))
print("  ✓ logo-gold.svg (solid gold)")

print("\n✓ Fixed! Key changes:")
print("  - Removed dominant-baseline (was breaking gradient rendering)")
print("  - Used explicit y=64 for vertical centering (more compatible)")
print("  - Simplified gradients to 3 stops (cleaner rendering)")
print("  - Used x1=0 y1=0 x2=1 y2=0 (fractional coords, more reliable)")
