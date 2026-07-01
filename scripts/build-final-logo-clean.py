#!/usr/bin/env python3
"""
Build the final Aura Living logo with TRANSPARENT backgrounds:
- Icon: remove the white background from the source PNG (make it transparent)
- Logo background: transparent (no off-white fill)

Also regenerate favicons with transparent backgrounds.
"""
import base64
import os
import io
from PIL import Image
import cairosvg
import numpy as np

ICON_PATH = "/home/z/my-project/download/aura-logos/AI-icon-source.png"
ICON_TRANSPARENT_PATH = "/home/z/my-project/download/aura-logos/AI-icon-transparent.png"
OUTPUT_SVG = "/home/z/my-project/logos/aura-living-logo.svg"
OUTPUT_PNG = "/home/z/my-project/download/aura-logos/aura-living-logo.png"
OUTPUT_PNG_TRANSPARENT = "/home/z/my-project/download/aura-logos/aura-living-logo-transparent.png"
FAVICON_DIR = "/home/z/my-project/download/aura-logos/favicons"

# ============================================================
# Step 1: Remove white background from the icon PNG
# ============================================================
print("Step 1: Removing white background from icon...")

img = Image.open(ICON_PATH).convert("RGBA")
arr = np.array(img)
h, w = arr.shape[:2]

# Find pixels that are near-white (R>235, G>235, B>235) and make them transparent
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
white_mask = (r > 235) & (g > 235) & (b > 235)

# Set alpha to 0 for white pixels
arr[white_mask, 3] = 0

# Also feather the edges slightly for smoother transparency
# (anti-alias the alpha channel at the boundary)
from PIL import ImageFilter
transparent_img = Image.fromarray(arr)
# Light feather to smooth the edge between icon and transparent area
transparent_img = transparent_img.filter(ImageFilter.GaussianBlur(radius=0.5))

transparent_img.save(ICON_TRANSPARENT_PATH, "PNG", optimize=True)
print(f"  ✓ Transparent icon saved: {ICON_TRANSPARENT_PATH}")
print(f"    Size: {os.path.getsize(ICON_TRANSPARENT_PATH)/1024:.1f} KB")

# ============================================================
# Step 2: Re-encode transparent icon as base64
# ============================================================
print("\nStep 2: Encoding transparent icon as base64...")
with open(ICON_TRANSPARENT_PATH, "rb") as f:
    icon_bytes = f.read()
icon_b64 = base64.b64encode(icon_bytes).decode("ascii")
print(f"  ✓ Base64 encoded ({len(icon_b64)/1024:.1f} KB)")

# ============================================================
# Step 3: Build SVG with NO background rect (transparent)
# ============================================================
print("\nStep 3: Building SVG with transparent background...")

final_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 1200 500" width="1200" height="500">
  <!-- AURA LIVING — Final Logo (Horizontal Lockup, Transparent Background)
       Icon: AI-generated, white background removed (transparent)
       Text: AURA LIVING wordmark + tagline
       No background rect — works on any color surface
       Self-contained: icon embedded as base64 PNG -->

  <!-- ============================================================
       ICON — AI-generated house emblem (left side, transparent bg)
       Original 1024x1024, displayed at 380x380, vertically centered
       ============================================================ -->
  <image x="60" y="60" width="380" height="380"
         xlink:href="data:image/png;base64,{icon_b64}"
         preserveAspectRatio="xMidYMid meet"/>

  <!-- ============================================================
       WORDMARK — AURA LIVING (right side, vertically centered)
       Bold geometric sans-serif, tracked, charcoal
       ============================================================ -->
  <text x="500" y="230"
        font-family="Avenir Next Heavy, Montserrat ExtraBold, Gilroy ExtraBold, Helvetica, Arial, sans-serif"
        font-size="82" font-weight="800"
        fill="#2E2E2E"
        letter-spacing="6">AURA LIVING</text>

  <!-- Mustard accent rule -->
  <line x1="505" y1="270" x2="1135" y2="270"
        stroke="#F2C66D" stroke-width="3" stroke-linecap="round"/>

  <!-- Tagline -->
  <text x="500" y="320"
        font-family="Avenir Next, Montserrat, Helvetica, Arial, sans-serif"
        font-size="18" font-weight="500"
        fill="#6B5D4F"
        letter-spacing="5">CONSIDERED OBJECTS FOR THE CONSIDERED HOME</text>
</svg>
'''

with open(OUTPUT_SVG, "w") as f:
    f.write(final_svg)

size_kb = os.path.getsize(OUTPUT_SVG) / 1024
print(f"  ✓ Transparent SVG saved: {OUTPUT_SVG} ({size_kb:.1f} KB)")

# Render PNG previews — one on white background (for visibility) and one truly transparent
# cairosvg can render with transparent background by not setting background_color
cairosvg.svg2png(url=OUTPUT_SVG, write_to=OUTPUT_PNG_TRANSPARENT, output_width=1200)
print(f"  ✓ Transparent PNG saved: {OUTPUT_PNG_TRANSPARENT} ({os.path.getsize(OUTPUT_PNG_TRANSPARENT)/1024:.1f} KB)")

# Also render a version on off-white for preview visibility (so user can see it)
cairosvg.svg2png(url=OUTPUT_SVG, write_to=OUTPUT_PNG, output_width=1200, background_color="#FAF8F4")
print(f"  ✓ Preview PNG (on off-white) saved: {OUTPUT_PNG} ({os.path.getsize(OUTPUT_PNG)/1024:.1f} KB)")

# ============================================================
# Step 4: Regenerate favicons with transparent backgrounds
# ============================================================
print("\nStep 4: Regenerating favicons with transparent backgrounds...")

# Use the transparent icon as the source for favicons
icon_transparent = Image.open(ICON_TRANSPARENT_PATH).convert("RGBA")
print(f"  Source: transparent icon {icon_transparent.size}")

# Clear old favicons
for f in os.listdir(FAVICON_DIR):
    os.remove(os.path.join(FAVICON_DIR, f))
print(f"  Cleared old favicons")

# Generate all standard favicon sizes (transparent)
sizes = [16, 32, 48, 64, 96, 120, 152, 167, 180, 192, 256, 384, 512]
for size in sizes:
    resized = icon_transparent.resize((size, size), Image.LANCZOS)
    out_path = os.path.join(FAVICON_DIR, f"favicon-{size}.png")
    resized.save(out_path, "PNG", optimize=True)
    print(f"  ✓ favicon-{size}.png ({os.path.getsize(out_path)/1024:.1f} KB)")

# Multi-size ICO (transparent)
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
ico_images = [icon_transparent.resize(s, Image.LANCZOS) for s in ico_sizes]
ico_path = os.path.join(FAVICON_DIR, "favicon.ico")
ico_images[0].save(ico_path, format="ICO", sizes=ico_sizes, append_images=ico_images[1:])
print(f"  ✓ favicon.ico ({os.path.getsize(ico_path)/1024:.1f} KB)")

# Apple touch icon — KEEP white background (iOS requires opaque icon)
apple_img = Image.new("RGBA", (180, 180), (255, 255, 255, 255))  # white bg for iOS
icon_180 = icon_transparent.resize((160, 160), Image.LANCZOS)
apple_img.paste(icon_180, (10, 10), icon_180)
apple_path = os.path.join(FAVICON_DIR, "apple-touch-icon-180.png")
apple_img.save(apple_path, "PNG", optimize=True)
print(f"  ✓ apple-touch-icon-180.png ({os.path.getsize(apple_path)/1024:.1f} KB) [white bg for iOS]")

print(f"\n✓ All done!")
print(f"  Transparent icon: {ICON_TRANSPARENT_PATH}")
print(f"  Transparent logo SVG: {OUTPUT_SVG}")
print(f"  Transparent logo PNG: {OUTPUT_PNG_TRANSPARENT}")
print(f"  Favicons (transparent): {FAVICON_DIR}")
