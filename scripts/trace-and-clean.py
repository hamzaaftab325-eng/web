#!/usr/bin/env python3
"""
Trace icon-v6 (the 9/10 best icon) to SVG with aggressive simplification
for cleaner output. Then post-process to remove the white background
and tiny artifacts.
"""
import os
import vtracer  # python3.13
from PIL import Image
import numpy as np

INPUT_PNG = "/home/z/my-project/logos/ai-generated/icon-v6.png"
CLEAN_PNG = "/home/z/my-project/logos/ai-generated/icon-v6-clean.png"
TRACED_SVG = "/home/z/my-project/logos/ai-generated/icon-v6-traced.svg"
FINAL_ICON_SVG = "/home/z/my-project/logos/ai-generated/icon-v6-final.svg"

# ============================================================
# Step 1: Pre-process the PNG — remove background, enhance contrast
# ============================================================
print("Step 1: Pre-processing PNG...")

img = Image.open(INPUT_PNG).convert("RGB")
arr = np.array(img).astype(int)
h, w = arr.shape[:2]

# The background should be pure white. Find pixels that are near-white
# (R>240, G>240, B>240) and make them pure white #FFFFFF.
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
white_mask = (r > 235) & (g > 235) & (b > 235)
arr[white_mask] = [255, 255, 255]

# Make the off-white background pure white for cleaner tracing
near_white = (r > 220) & (g > 220) & (b > 220) & (r == g) & (g == b)
arr[near_white] = [255, 255, 255]

# Save cleaned PNG
clean_img = Image.fromarray(arr.astype(np.uint8))
clean_img = clean_img.resize((1024, 1024), Image.LANCZOS)
clean_img.save(CLEAN_PNG)
print(f"  ✓ Cleaned PNG saved: {CLEAN_PNG}")

# ============================================================
# Step 2: Trace with aggressive simplification
# ============================================================
print("\nStep 2: Tracing to SVG with aggressive simplification...")

vtracer.convert_image_to_svg_py(
    image_path=CLEAN_PNG,
    out_path=TRACED_SVG,
    colormode='color',
    hierarchical='stacked',
    mode='spline',
    filter_speckle=10,          # aggressive: remove small artifacts (was 4)
    color_precision=4,          # fewer colors (was 6)
    layer_difference=30,        # larger layer differences (was 20)
    corner_threshold=80,        # smoother corners (was 60)
    length_threshold=8.0,       # skip shorter paths (was 4.0)
    max_iterations=10,
    splice_threshold=60,        # smoother splices (was 45)
    path_precision=6            # less precision = smaller file (was 8)
)
size_kb = os.path.getsize(TRACED_SVG) / 1024
print(f"  ✓ Traced SVG saved: {TRACED_SVG} ({size_kb:.1f} KB)")

# ============================================================
# Step 3: Post-process the SVG
# - Remove the giant background rectangle (first path, usually white #FFFFFF or #FEFEFE)
# - Remove paths that are mostly white (background artifacts)
# ============================================================
print("\nStep 3: Post-processing SVG (removing background paths)...")

with open(TRACED_SVG, "r") as f:
    content = f.read()

# Extract paths
import re
# Find all <path ... /> elements
path_pattern = re.compile(r'<path\s+d="([^"]*)"\s+fill="([^"]*)"\s+transform="([^"]*)"\s*/>')
paths = path_pattern.findall(content)
print(f"  Found {len(paths)} paths total")

# Filter out paths that are:
# 1. White or near-white fill (background)
# 2. Very short paths (artifacts)
kept_paths = []
removed = 0
for d, fill, transform in paths:
    # Skip white/near-white fills
    if fill.upper() in ['#FFFFFF', '#FEFEFE', '#FDFDFD', '#FCFCFC', '#F8F8F8', '#F9F9F9', '#FAFAFA']:
        removed += 1
        continue
    # Skip very short paths (likely artifacts)
    if len(d) < 100:
        removed += 1
        continue
    kept_paths.append((d, fill, transform))

print(f"  Removed {removed} background/artifact paths")
print(f"  Kept {len(kept_paths)} substantive paths")

# Build clean SVG
clean_paths_xml = ""
for d, fill, transform in kept_paths:
    clean_paths_xml += f'  <path d="{d}" fill="{fill}" transform="{transform}"/>\n'

final_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <!-- Aura Living icon — AI-generated, auto-traced, cleaned -->
  <!-- No background (transparent) -->
{clean_paths_xml}</svg>
'''

with open(FINAL_ICON_SVG, "w") as f:
    f.write(final_svg)

final_size = os.path.getsize(FINAL_ICON_SVG) / 1024
print(f"  ✓ Final clean icon SVG: {FINAL_ICON_SVG} ({final_size:.1f} KB)")

# Render to PNG for preview
import cairosvg
cairosvg.svg2png(url=FINAL_ICON_SVG, write_to="/home/z/my-project/logos/ai-generated/icon-v6-final-preview.png", output_width=800, background_color="#FAF8F4")
print("  ✓ Preview PNG rendered")
