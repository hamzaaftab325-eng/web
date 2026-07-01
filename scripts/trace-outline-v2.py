#!/usr/bin/env python3
"""
Trace house outline with CORRECT color masks that exclude the gray background.
"""
from PIL import Image
import numpy as np

IMG_PATH = "/home/z/my-project/upload/pasted_image_1782870177796.png"
img = Image.open(IMG_PATH).convert("RGB")
arr = np.array(img).astype(int)
h, w = arr.shape[:2]

r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Background is #F0F0F0 (240,240,240) — R=G=B exactly
# Grid lines are #E0E0E0 (224,224,224) — also R=G=B
# We need to EXCLUDE gray (where R≈G≈B)

# Yellow #F0D090: R=240, G=208, B=144 → R-G=32, G-B=64, R>B significantly
# Brown #D0C0B0: R=208, G=192, B=176 → R-G=16, G-B=16, all close but R>G>B

# Better masks: require R > G+10 AND G > B+10 (excludes gray where R=G=B)
yellow_mask = (r > 200) & (g > 160) & (g < r - 20) & (b < g - 30)
brown_mask = (r > 170) & (r < 230) & (g > 150) & (g < r) & (b < g) & (b > 130) & (r - b < 60) & ~yellow_mask

house_mask = yellow_mask | brown_mask

print("="*70)
print("CORRECTED COLOR DETECTION")
print("="*70)

yellow_ys, yellow_xs = np.where(yellow_mask)
brown_ys, brown_xs = np.where(brown_mask)

print(f"YELLOW: {len(yellow_xs)} pixels")
if len(yellow_xs) > 0:
    print(f"  x range: {yellow_xs.min()}→{yellow_xs.max()}")
    print(f"  y range: {yellow_ys.min()}→{yellow_ys.max()}")
    # Sample some yellow pixels
    print(f"  Sample colors: ", end="")
    for i in range(0, len(yellow_xs), max(1, len(yellow_xs)//5)):
        x, y = yellow_xs[i], yellow_ys[i]
        print(f"({arr[y,x,0]},{arr[y,x,1]},{arr[y,x,2]}) ", end="")
    print()

print(f"BROWN: {len(brown_xs)} pixels")
if len(brown_xs) > 0:
    print(f"  x range: {brown_xs.min()}→{brown_xs.max()}")
    print(f"  y range: {brown_ys.min()}→{brown_ys.max()}")
    print(f"  Sample colors: ", end="")
    for i in range(0, len(brown_xs), max(1, len(brown_xs)//5)):
        x, y = brown_xs[i], brown_ys[i]
        print(f"({arr[y,x,0]},{arr[y,x,1]},{arr[y,x,2]}) ", end="")
    print()

# ============================================================
# PEAK ANALYSIS
# ============================================================
print("\n" + "="*70)
print("PEAK ANALYSIS")
print("="*70)

if len(yellow_ys) > 0:
    y_peak_idx = np.argmin(yellow_ys)
    print(f"YELLOW PEAK: x={yellow_xs[y_peak_idx]}, y={yellow_ys[y_peak_idx]}")

if len(brown_ys) > 0:
    b_peak_idx = np.argmin(brown_ys)
    print(f"BROWN PEAK:  x={brown_xs[b_peak_idx]}, y={brown_ys[b_peak_idx]}")

print(f"Image center x = {w//2}")

# ============================================================
# ROOF LINE — top edge of house (combined) for every x
# ============================================================
print("\n" + "="*70)
print("ROOF LINE — top edge of house for every x (every 8px)")
print("="*70)

print(f"\n{'x':>4s}  {'top_y':>6s}  {'color':>6s}")
for x in range(0, w, 8):
    col_house = house_mask[:, x]
    ys = np.where(col_house)[0]
    if len(ys) > 0:
        top_y = ys[0]
        is_y = yellow_mask[top_y, x]
        is_b = brown_mask[top_y, x]
        color = "Y" if is_y else ("B" if is_b else "?")
        print(f"{x:4d}  {top_y:6d}  {color:>6s}")
    else:
        print(f"{x:4d}  {'---':>6s}  {'-':>6s}")

# ============================================================
# Check: does yellow and brown share a vertical boundary, or is there a gap?
# ============================================================
print("\n" + "="*70)
print("BOUNDARY ANALYSIS — do yellow and brown touch?")
print("="*70)

# Find the rightmost yellow x and leftmost brown x
if len(yellow_xs) > 0 and len(brown_xs) > 0:
    y_right = yellow_xs.max()
    b_left = brown_xs.min()
    print(f"Yellow rightmost x: {y_right}")
    print(f"Brown leftmost x:   {b_left}")
    if b_left > y_right:
        print(f"GAP of {b_left - y_right}px between yellow and brown (separate shapes!)")
    elif b_left == y_right:
        print("Yellow and brown share an edge (touching but separate)")
    else:
        print(f"Yellow and brown OVERLAP by {y_right - b_left}px (same shape, two colors)")

# ============================================================
# ASCII visualization of the entire house outline
# ============================================================
print("\n" + "="*70)
print("ASCII HOUSE MAP (full house, every 4px, Y=yellow, B=brown, .=bg)")
print("="*70)

house_ys_all, house_xs_all = np.where(house_mask)
if len(house_ys_all) > 0:
    x_min, x_max = house_xs_all.min(), house_xs_all.max()
    y_min, y_max = house_ys_all.min(), house_ys_all.max()
    print(f"House bounding box: x={x_min}→{x_max}, y={y_min}→{y_max}")
    print()

    # Print every 4th row, every 4th column
    for y in range(y_min, y_max + 1, 4):
        line = ""
        for x in range(x_min, x_max + 1, 4):
            if yellow_mask[y, x]:
                line += "Y"
            elif brown_mask[y, x]:
                line += "B"
            else:
                line += "."
        print(f"  y={y:3d} |{line}|")

# ============================================================
# Save zoomed crops
# ============================================================
print("\n" + "="*70)
print("SAVING ZOOMED CROPS")
print("="*70)

# Crop just the house
crop = img.crop((x_min - 10, y_min - 10, x_max + 10, y_max + 10))
crop_zoomed = crop.resize((crop.width * 4, crop.height * 4), Image.NEAREST)
crop_zoomed.save("/home/z/my-project/download/aura-logos/REFERENCE-house-4x.png")
print(f"  House 4x zoom: /home/z/my-project/download/aura-logos/REFERENCE-house-4x.png ({crop_zoomed.size})")

# Also save the yellow-only and brown-only as separate images
yellow_img = Image.new("RGB", (w, h), (255, 255, 255))
yellow_arr = np.array(yellow_img)
yellow_arr[yellow_mask] = [240, 208, 144]
Image.fromarray(yellow_arr).save("/home/z/my-project/download/aura-logos/REFERENCE-yellow-only.png")

brown_img = Image.new("RGB", (w, h), (255, 255, 255))
brown_arr = np.array(brown_img)
brown_arr[brown_mask] = [208, 192, 176]
Image.fromarray(brown_arr).save("/home/z/my-project/download/aura-logos/REFERENCE-brown-only.png")

print(f"  Yellow only: /home/z/my-project/download/aura-logos/REFERENCE-yellow-only.png")
print(f"  Brown only:  /home/z/my-project/download/aura-logos/REFERENCE-brown-only.png")
