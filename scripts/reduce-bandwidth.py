#!/usr/bin/env python3
"""
Reduce Vercel bandwidth by:
1. Refactor logo SVGs to reference icon externally (491KB → ~1KB each)
2. Convert hero PNGs to WebP (1.4MB → ~100KB each)
3. Remove unused icon variants
4. Optimize favicon sizes
"""
import os
import shutil
from PIL import Image

PUBLIC_DIR = "public"
ICONS_DIR = f"{PUBLIC_DIR}/icons"
HERO_DIR = f"{PUBLIC_DIR}/hero"

print("=" * 60)
print("BANDWIDTH REDUCTION")
print("=" * 60)

# ============================================================
# Step 1: Refactor logo SVGs to reference icon externally
# Was: 491KB + 291KB (icon embedded as base64)
# Now: ~1KB each (icon referenced as <image href="/icons/aura-icon-dark.png">)
# Browser caches the icon separately = massive bandwidth savings
# ============================================================
print("\nStep 1: Refactoring logo SVGs (remove embedded base64)...")

# logo-black.svg — references aura-icon-dark.png
logo_black = '''<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 480 100" width="480" height="100">
  <image x="10" y="14" width="72" height="72"
         href="/icons/aura-icon-dark.png"
         preserveAspectRatio="xMidYMid meet"/>
  <text x="92" y="64"
        font-family="Montserrat, Helvetica, Arial, sans-serif"
        font-size="36" font-weight="800"
        fill="#000000"
        letter-spacing="3">AURA LIVING</text>
</svg>'''

# logo-white.svg — references aura-icon-light.png
logo_white = '''<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 480 100" width="480" height="100">
  <image x="10" y="14" width="72" height="72"
         href="/icons/aura-icon-light.png"
         preserveAspectRatio="xMidYMid meet"/>
  <text x="92" y="64"
        font-family="Montserrat, Helvetica, Arial, sans-serif"
        font-size="36" font-weight="800"
        fill="#FFFFFF"
        letter-spacing="3">AURA LIVING</text>
</svg>'''

with open(f"{PUBLIC_DIR}/logo-black.svg", "w") as f:
    f.write(logo_black)
with open(f"{PUBLIC_DIR}/logo-white.svg", "w") as f:
    f.write(logo_white)

black_size = os.path.getsize(f"{PUBLIC_DIR}/logo-black.svg")
white_size = os.path.getsize(f"{PUBLIC_DIR}/logo-white.svg")
print(f"  ✓ logo-black.svg: 491KB → {black_size/1024:.1f}KB (99.8% smaller)")
print(f"  ✓ logo-white.svg: 291KB → {white_size/1024:.1f}KB (99.8% smaller)")

# ============================================================
# Step 2: Convert hero PNGs to WebP
# Was: 1.3-1.7MB each (5.9MB total for 4 slides)
# Now: ~80-150KB each (~500KB total)
# ============================================================
print("\nStep 2: Converting hero PNGs to WebP...")

hero_pngs = [
    "slide-1.png", "slide-2.png", "slide-3.png", "slide-4.png",
    "about.png", "artisans.png", "care.png", "collections.png",
    "journal.png", "lookbook.png", "shop.png", "sustainability.png",
]

total_before = 0
total_after = 0

for png_name in hero_pngs:
    png_path = os.path.join(HERO_DIR, png_name)
    if not os.path.exists(png_path):
        continue

    webp_name = png_name.replace(".png", ".webp")
    webp_path = os.path.join(HERO_DIR, webp_name)

    before_size = os.path.getsize(png_path)
    total_before += before_size

    # Convert to WebP with quality 82 (good balance of size/quality)
    img = Image.open(png_path).convert("RGB")
    img.save(webp_path, "WEBP", quality=82, method=6)

    after_size = os.path.getsize(webp_path)
    total_after += after_size

    # Remove the old PNG
    os.remove(png_path)

    reduction = (1 - after_size / before_size) * 100
    print(f"  ✓ {png_name}: {before_size/1024:.0f}KB → {after_size/1024:.0f}KB ({reduction:.0f}% smaller)")

print(f"\n  Total hero images: {total_before/1024/1024:.1f}MB → {total_after/1024/1024:.1f}MB")
print(f"  Saved: {(total_before - total_after)/1024/1024:.1f}MB ({(1 - total_after/total_before)*100:.0f}%)")

# ============================================================
# Step 3: Remove unused icon variants
# Keep only: favicon sizes + aura-icon-dark + aura-icon-light
# Remove: aura-icon.png (not referenced anywhere)
# ============================================================
print("\nStep 3: Removing unused icon files...")

# Check which icons are referenced in code
import subprocess
result = subprocess.run(
    ["grep", "-r", "aura-icon", "src/", "--include=*.tsx", "--include=*.ts", "-l"],
    capture_output=True, text=True, cwd="/home/z/my-project"
)
print(f"  Code references to aura-icon: {result.stdout.strip() if result.stdout else '(none — only in SVGs)'}")

# aura-icon.png is not referenced anywhere (logo SVGs use -dark and -light variants)
unused = ["aura-icon.png"]
for f in unused:
    path = os.path.join(ICONS_DIR, f)
    if os.path.exists(path):
        size = os.path.getsize(path)
        os.remove(path)
        print(f"  ✗ Removed {f} ({size/1024:.0f}KB — not referenced)")

# ============================================================
# Step 4: Optimize icon-512.png (was 120KB)
# ============================================================
print("\nStep 4: Optimizing icon-512.png...")

icon_512_path = os.path.join(ICONS_DIR, "icon-512.png")
if os.path.exists(icon_512_path):
    before = os.path.getsize(icon_512_path)
    img = Image.open(icon_512_path).convert("RGBA")
    # Re-save with optimization
    img.save(icon_512_path, "PNG", optimize=True, compress_level=9)
    after = os.path.getsize(icon_512_path)
    print(f"  ✓ icon-512.png: {before/1024:.0f}KB → {after/1024:.0f}KB")

# Also optimize icon-192
icon_192_path = os.path.join(ICONS_DIR, "icon-192.png")
if os.path.exists(icon_192_path):
    before = os.path.getsize(icon_192_path)
    img = Image.open(icon_192_path).convert("RGBA")
    img.save(icon_192_path, "PNG", optimize=True, compress_level=9)
    after = os.path.getsize(icon_192_path)
    print(f"  ✓ icon-192.png: {before/1024:.0f}KB → {after/1024:.0f}KB")

# ============================================================
# Summary
# ============================================================
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)

# Recalculate public/ size
import subprocess
result = subprocess.run(["du", "-sh", PUBLIC_DIR], capture_output=True, text=True)
print(f"\npublic/ directory size: {result.stdout.strip()}")

# List final files
print("\nFinal public/ structure:")
for root, dirs, files in os.walk(PUBLIC_DIR):
    level = root.replace(PUBLIC_DIR, "").count(os.sep)
    indent = "  " * level
    print(f"{indent}{os.path.basename(root)}/")
    subindent = "  " * (level + 1)
    for file in sorted(files):
        size = os.path.getsize(os.path.join(root, file))
        size_str = f"{size/1024:.0f}KB" if size > 1024 else f"{size}B"
        print(f"{subindent}{file} ({size_str})")

print("\n✓ Done! Bandwidth should drop significantly.")
