#!/usr/bin/env python3
"""
Analyze the reference logo pixel by pixel — NO VLM, just raw image data.
Extract: dominant colors, shapes, positions, outline detection.
"""
from PIL import Image
import numpy as np
from collections import Counter

IMG_PATH = "/home/z/my-project/upload/pasted_image_1782870177796.png"

img = Image.open(IMG_PATH).convert("RGB")
print(f"Image size: {img.size} (width x height)")
print(f"Mode: {img.mode}")

arr = np.array(img)
h, w = arr.shape[:2]
print(f"Array shape: {arr.shape}")

# ============================================================
# 1. Find dominant colors (quantize to find the palette)
# ============================================================
print("\n" + "="*60)
print("1. DOMINANT COLORS (top 15)")
print("="*60)

# Quantize to reduce color count
small = img.resize((200, 200))
pixels = list(small.getdata())
# Round to nearest 16 to group similar colors
rounded = [(r//16*16, g//16*16, b//16*16) for r, g, b in pixels]
counter = Counter(rounded)
for color, count in counter.most_common(15):
    pct = count / len(pixels) * 100
    hex_color = '#{:02X}{:02X}{:02X}'.format(*color)
    print(f"  {hex_color}  count={count:5d}  ({pct:5.1f}%)  rgb={color}")

# ============================================================
# 2. Analyze horizontal bands (top to bottom) to find structure
# ============================================================
print("\n" + "="*60)
print("2. HORIZONTAL BAND ANALYSIS (top to bottom, every 20px)")
print("="*60)

for y in range(0, h, 20):
    row = arr[y]
    # Find unique colors in this row (quantized)
    row_colors = [(r//32*32, g//32*32, b//32*32) for r, g, b in row]
    unique = set(row_colors)
    # Skip if mostly white/background
    non_bg = [c for c in unique if not (c[0] > 240 and c[1] > 240 and c[2] > 240)]
    if non_bg:
        # Find leftmost and rightmost non-background pixel
        non_bg_indices = [i for i, c in enumerate(row_colors) if not (c[0] > 240 and c[1] > 240 and c[2] > 240)]
        if non_bg_indices:
            left = min(non_bg_indices)
            right = max(non_bg_indices)
            print(f"  y={y:3d}  x range: {left:3d}→{right:3d}  width={right-left:3d}  colors: {len(non_bg)}")
            # Show the colors present
            for c in non_bg[:5]:
                hex_c = '#{:02X}{:02X}{:02X}'.format(c[0]//32*32, c[1]//32*32, c[2]//32*32)
                print(f"         {hex_c}")

# ============================================================
# 3. Find the house region (largest non-white, non-text block)
# ============================================================
print("\n" + "="*60)
print("3. FIND HOUSE BOUNDING BOX (colored regions)")
print("="*60)

# Mask: non-white, non-black (colored = the house fill)
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
# Yellow-ish: R>200, G>180, B<180
yellow_mask = (r > 200) & (g > 180) & (b < 180)
# Brown/beige-ish: R>180, G>140, B>140, R>G>B
brown_mask = (r > 180) & (g > 140) & (b > 140) & (r >= g) & (g >= b) & ~yellow_mask

yellow_ys, yellow_xs = np.where(yellow_mask)
brown_ys, brown_xs = np.where(brown_mask)

if len(yellow_xs) > 0:
    print(f"YELLOW region: x={yellow_xs.min()}→{yellow_xs.max()}  y={yellow_ys.min()}→{yellow_ys.max()}  pixels={len(yellow_xs)}")
if len(brown_xs) > 0:
    print(f"BROWN region:  x={brown_xs.min()}→{brown_xs.max()}  y={brown_ys.min()}→{brown_ys.max()}  pixels={len(brown_xs)}")

# ============================================================
# 4. Check if yellow and brown share the same vertical extent (one house)
# or have separate roofs (two peaks)
# ============================================================
print("\n" + "="*60)
print("4. ROOF ANALYSIS — top edges of yellow vs brown")
print("="*60)

# For each x column, find the topmost yellow pixel and topmost brown pixel
print("Column-by-column top edges (every 10px across):")
print(f"  {'x':>4s}  {'yellow_top':>10s}  {'brown_top':>10s}  {'gap?':>6s}")
for x in range(0, w, 10):
    y_col_yellow = yellow_mask[:, x]
    y_col_brown = brown_mask[:, x]
    y_top = np.where(y_col_yellow)[0]
    b_top = np.where(y_col_brown)[0]
    y_t = y_top.min() if len(y_top) > 0 else None
    b_t = b_top.min() if len(b_top) > 0 else None
    if y_t is not None or b_t is not None:
        gap = ""
        if y_t is not None and b_t is not None:
            gap = f"{abs(y_t - b_t):4d}px"
        print(f"  {x:4d}  {str(y_t):>10s}  {str(b_t):>10s}  {gap:>6s}")

# ============================================================
# 5. Find black outlines (dark pixels)
# ============================================================
print("\n" + "="*60)
print("5. BLACK OUTLINE ANALYSIS")
print("="*60)
black_mask = (r < 80) & (g < 80) & (b < 80)
black_ys, black_xs = np.where(black_mask)
if len(black_xs) > 0:
    print(f"Black pixels: {len(black_xs)}")
    print(f"Black region: x={black_xs.min()}→{black_xs.max()}  y={black_ys.min()}→{black_ys.max()}")

# ============================================================
# 6. Save a zoomed crop of just the house for manual inspection
# ============================================================
print("\n" + "="*60)
print("6. SAVING CROPPED HOUSE VIEW")
print("="*60)
# Crop the house region (top 60% of image, center horizontally)
crop = img.crop((50, 20, 470, 250))
crop.save("/home/z/my-project/download/aura-logos/REFERENCE-house-crop.png")
print(f"  Saved: /home/z/my-project/download/aura-logos/REFERENCE-house-crop.png ({crop.size})")

# Also save at 4x zoom
crop_big = crop.resize((crop.width * 3, crop.height * 3), Image.NEAREST)
crop_big.save("/home/z/my-project/download/aura-logos/REFERENCE-house-3x.png")
print(f"  Saved: /home/z/my-project/download/aura-logos/REFERENCE-house-3x.png ({crop_big.size})")
