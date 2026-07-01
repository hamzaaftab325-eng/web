#!/usr/bin/env python3
"""
Build the final Aura Living logo — HORIZONTAL lockup (icon left + text right)
+ generate favicon sizes (16, 32, 48, 192, 512) from the icon.
"""
import base64
import os
from PIL import Image
import cairosvg

ICON_PATH = "/home/z/my-project/download/aura-logos/AI-icon-source.png"
OUTPUT_SVG = "/home/z/my-project/logos/aura-living-logo.svg"
OUTPUT_PNG = "/home/z/my-project/download/aura-logos/aura-living-logo.png"
FAVICON_DIR = "/home/z/my-project/download/aura-logos/favicons"

# ============================================================
# Step 1: Read icon PNG and encode as base64
# ============================================================
print("Step 1: Loading icon...")
with open(ICON_PATH, "rb") as f:
    icon_bytes = f.read()
icon_b64 = base64.b64encode(icon_bytes).decode("ascii")
print(f"  ✓ Loaded icon ({len(icon_bytes)/1024:.1f} KB)")

# ============================================================
# Step 2: Build HORIZONTAL lockup SVG (icon left + text right)
# ============================================================
print("\nStep 2: Building horizontal lockup SVG...")

# Layout: 1200x500 viewBox
# Icon: 400x400 on left (x=50, y=50)
# Text: starts at x=500, centered vertically
# Wordmark "AURA LIVING" + thin rule + tagline
final_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 1200 500" width="1200" height="500">
  <!-- AURA LIVING — Final Logo (Horizontal Lockup)
       Icon: AI-generated house emblem (left)
       Text: AURA LIVING wordmark + tagline (right)
       Self-contained: icon embedded as base64 PNG -->

  <!-- Off-white background -->
  <rect width="1200" height="500" fill="#FAF8F4"/>

  <!-- ============================================================
       ICON — AI-generated house emblem (left side)
       Original 1024x1024, displayed at 380x380, vertically centered
       ============================================================ -->
  <image x="60" y="60" width="380" height="380"
         xlink:href="data:image/png;base64,{icon_b64}"
         preserveAspectRatio="xMidYMid meet"/>

  <!-- ============================================================
       WORDMARK — AURA LIVING (right side, vertically centered)
       Bold geometric sans-serif, tracked, charcoal
       ============================================================ -->
  <!-- Main wordmark -->
  <text x="500" y="230"
        font-family="Avenir Next Heavy, Montserrat ExtraBold, Gilroy ExtraBold, Helvetica, Arial, sans-serif"
        font-size="82" font-weight="800"
        fill="#2E2E2E"
        letter-spacing="6">AURA LIVING</text>

  <!-- Mustard accent rule (under wordmark, aligned to text width) -->
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
print(f"  ✓ Horizontal lockup SVG saved: {OUTPUT_SVG} ({size_kb:.1f} KB)")

# Render to PNG for preview
cairosvg.svg2png(url=OUTPUT_SVG, write_to=OUTPUT_PNG, output_width=1200)
print(f"  ✓ Preview PNG saved: {OUTPUT_PNG} ({os.path.getsize(OUTPUT_PNG)/1024:.1f} KB)")

# ============================================================
# Step 3: Generate favicon sizes from the icon
# ============================================================
print("\nStep 3: Generating favicon sizes...")

os.makedirs(FAVICON_DIR, exist_ok=True)

# Open the original icon (1024x1024, high quality source)
icon_img = Image.open(ICON_PATH).convert("RGBA")
print(f"  Source icon: {icon_img.size}")

# Generate all standard favicon sizes
sizes = [16, 32, 48, 64, 96, 120, 152, 167, 180, 192, 256, 384, 512]
for size in sizes:
    # Resize with high-quality LANCZOS resampling
    resized = icon_img.resize((size, size), Image.LANCZOS)
    out_path = os.path.join(FAVICON_DIR, f"favicon-{size}.png")
    resized.save(out_path, "PNG", optimize=True)
    print(f"  ✓ favicon-{size}.png ({os.path.getsize(out_path)/1024:.1f} KB)")

# Also save as favicon.ico (multi-size ICO with 16, 32, 48)
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
ico_images = [icon_img.resize(s, Image.LANCZOS) for s in ico_sizes]
ico_path = os.path.join(FAVICON_DIR, "favicon.ico")
ico_images[0].save(ico_path, format="ICO", sizes=ico_sizes, append_images=ico_images[1:])
print(f"  ✓ favicon.ico ({os.path.getsize(ico_path)/1024:.1f} KB) — multi-size (16, 32, 48, 64)")

# Also create an apple-touch-icon (180x180 with white bg for iOS)
apple_img = Image.new("RGBA", (180, 180), (250, 248, 244, 255))  # off-white bg
icon_180 = icon_img.resize((160, 160), Image.LANCZOS)  # slight padding
apple_img.paste(icon_180, (10, 10), icon_180 if icon_180.mode == "RGBA" else None)
apple_path = os.path.join(FAVICON_DIR, "apple-touch-icon-180.png")
apple_img.save(apple_path, "PNG", optimize=True)
print(f"  ✓ apple-touch-icon-180.png ({os.path.getsize(apple_path)/1024:.1f} KB)")

print(f"\n✓ All favicons saved to: {FAVICON_DIR}")
print(f"  Total files: {len(os.listdir(FAVICON_DIR))}")
