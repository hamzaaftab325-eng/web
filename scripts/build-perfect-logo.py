#!/usr/bin/env python3
"""
Strip ALL gradients. Keep ONLY 2 logo versions: white + black.
No gold, no gradient aliases, no inline styles.

Final clean state:
- public/logo-white.svg  — solid white text + white-outlined icon (dark backgrounds)
- public/logo-black.svg  — solid black text + dark-outlined icon (light backgrounds)

Plus backward-compatible aliases so existing code doesn't break:
- public/logo.svg        → copy of logo-black.svg
- public/logo-light.svg  → copy of logo-white.svg
- public/logo-dark.svg   → copy of logo-black.svg
- public/logo-white.svg  → stays as-is
- public/logo-gradient.svg → REMOVED (no longer needed)
- public/logo-gold.svg   → REMOVED (no longer needed)
"""
import base64
import os
from PIL import Image
import numpy as np

ICON_SOURCE = "/home/z/my-project/public/icons/aura-icon.png"

# ============================================================
# Step 1: Generate the 2 icon variants (white outlines + black outlines)
# ============================================================
print("Step 1: Generating icon variants...")

img = Image.open(ICON_SOURCE).convert("RGBA")
arr = np.array(img)

# Remove pure white background
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
pure_white = (r > 240) & (g > 240) & (b > 240)
arr[pure_white, 3] = 0

# Black-outlined icon (for light backgrounds) — save as-is
Image.fromarray(arr).save("/home/z/my-project/public/icons/aura-icon-dark.png", "PNG", optimize=True)
print("  ✓ aura-icon-dark.png (black outlines, for light backgrounds)")

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
# Step 2: Build ONLY 2 logo versions (white + black)
# ============================================================
print("\nStep 2: Building 2 logo versions (white + black only)...")

def build_logo(icon_b64, text_color):
    """Build a clean, solid-color logo. No gradients. No inline styles."""
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


# 1. WHITE logo (for dark backgrounds)
with open("/home/z/my-project/public/logo-white.svg", "w") as f:
    f.write(build_logo(icon_light_b64, "#FFFFFF"))
print("  ✓ logo-white.svg (solid white, for dark backgrounds)")

# 2. BLACK logo (for light backgrounds)
with open("/home/z/my-project/public/logo-black.svg", "w") as f:
    f.write(build_logo(icon_dark_b64, "#000000"))
print("  ✓ logo-black.svg (solid black, for light backgrounds)")


# ============================================================
# Step 3: Remove gold + gradient files, set up aliases
# ============================================================
print("\nStep 3: Cleaning up redundant files...")

import shutil

# Remove gold and gradient files (no longer needed)
for f in ["logo-gold.svg", "logo-gradient.svg"]:
    path = f"/home/z/my-project/public/{f}"
    if os.path.exists(path):
        os.remove(path)
        print(f"  ✗ Removed {f}")

# Backward-compatible aliases (so existing code doesn't break)
shutil.copy("/home/z/my-project/public/logo-black.svg", "/home/z/my-project/public/logo.svg")
shutil.copy("/home/z/my-project/public/logo-white.svg", "/home/z/my-project/public/logo-light.svg")
shutil.copy("/home/z/my-project/public/logo-black.svg", "/home/z/my-project/public/logo-dark.svg")
print("  ✓ Aliases: logo.svg, logo-light.svg, logo-dark.svg (backward compat)")

print("\n✓ Done! Final state:")
print("  ONLY 2 real logos: logo-white.svg + logo-black.svg")
print("  3 backward-compat aliases: logo.svg, logo-light.svg, logo-dark.svg")
print("  NO gradients, NO gold, NO inline styles")
print("  White logo: white text + white-outlined icon (dark backgrounds)")
print("  Black logo: black text + black-outlined icon (light backgrounds)")
