#!/usr/bin/env python3
"""
Trace the EXACT outline of the house in the reference logo.
Find the boundary between background and house colors for every column.
This gives me the precise roof shape.
"""
from PIL import Image
import numpy as np

IMG_PATH = "/home/z/my-project/upload/pasted_image_1782870177796.png"
img = Image.open(IMG_PATH).convert("RGB")
arr = np.array(img)
h, w = arr.shape[:2]

# Background is #F0F0F0 (240,240,240) with grid lines #E0E0E0 (224,224,224)
# House yellow is around #F0D090 (240, 208, 144)
# House brown is around #D0C0B0 (208, 192, 176)

r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]

# Yellow mask: high R, high G, lower B (yellow = R>G>B)
yellow_mask = (r > 200) & (g > 160) & (b < 200) & (r >= g) & (g > b)
# Brown/beige mask: medium R, medium G, medium B, R>=G>=B
brown_mask = (r > 160) & (g > 130) & (b > 110) & (r >= g) & (g >= b) & ~yellow_mask
# Combined house mask
house_mask = yellow_mask | brown_mask

print("="*70)
print("HOUSE OUTLINE — top edge for every x column (the roof line)")
print("="*70)
print(f"{'x':>4s}  {'top_y':>6s}  {'color':>8s}  {'is_yellow':>10s}  {'is_brown':>10s}")
print("-"*70)

# For every x, find the topmost house pixel and what color it is
prev_color = None
roof_points = []
for x in range(w):
    col = house_mask[:, x]
    ys = np.where(col)[0]
    if len(ys) > 0:
        top_y = ys[0]
        is_yellow = yellow_mask[top_y, x]
        is_brown = brown_mask[top_y, x]
        color = "Y" if is_yellow else ("B" if is_brown else "?")
        roof_points.append((x, top_y, color))
    else:
        roof_points.append((x, None, "-"))

# Print roof line as ASCII chart
print("\nASCII ROOF LINE (top edge of house, viewed from above):")
print("Each char = 8px. Y=yellow, B=brown, .=background, |=transition")
print()
for x in range(0, w, 4):
    point = roof_points[x]
    x_val, top_y, color = point
    if top_y is None:
        char = "."
    else:
        char = color.lower()
    print(f"x={x:3d}  top_y={str(top_y):>4s}  {char}")

# ============================================================
# Find the EXACT roof profile — where does yellow start, where does brown start
# ============================================================
print("\n" + "="*70)
print("ROOF PROFILE — detailed transition analysis")
print("="*70)

# Find leftmost yellow, leftmost brown, rightmost yellow, rightmost brown
yellow_ys, yellow_xs = np.where(yellow_mask)
brown_ys, brown_xs = np.where(brown_mask)

print(f"YELLOW: x range {yellow_xs.min()}→{yellow_xs.max()}, y range {yellow_ys.min()}→{yellow_ys.max()}")
print(f"BROWN:  x range {brown_xs.min()}→{brown_xs.max()}, y range {brown_ys.min()}→{brown_ys.max()}")

# For each x, find top of yellow and top of brown
print(f"\n{'x':>4s}  {'yel_top':>7s}  {'brn_top':>7s}  {'comment':>20s}")
print("-"*50)
for x in range(w):
    y_col = yellow_mask[:, x]
    b_col = brown_mask[:, x]
    y_t = np.where(y_col)[0]
    b_t = np.where(b_col)[0]
    y_top = y_t.min() if len(y_t) > 0 else None
    b_top = b_t.min() if len(b_t) > 0 else None

    # Only print at transitions or every 20px
    if x % 20 == 0 or (y_top is not None and b_top is not None and abs(y_top - b_top) < 5):
        comment = ""
        if y_top is not None and b_top is not None:
            if abs(y_top - b_top) < 5:
                comment = "SAME HEIGHT (shared roof?)"
            elif y_top < b_top:
                comment = f"yellow higher by {b_top - y_top}px"
            else:
                comment = f"brown higher by {y_top - b_top}px"
        elif y_top is not None:
            comment = "yellow only"
        elif b_top is not None:
            comment = "brown only"
        print(f"{x:4d}  {str(y_top):>7s}  {str(b_top):>7s}  {comment:>20s}")

# ============================================================
# Find the PEAK of each color (the highest point)
# ============================================================
print("\n" + "="*70)
print("PEAK ANALYSIS")
print("="*70)

# Yellow peak (highest yellow pixel)
y_peak_idx = np.argmin(yellow_ys)
y_peak_x = yellow_xs[y_peak_idx]
y_peak_y = yellow_ys[y_peak_idx]
print(f"YELLOW PEAK: x={y_peak_x}, y={y_peak_y} (this is the highest yellow pixel)")

# Brown peak
b_peak_idx = np.argmin(brown_ys)
b_peak_x = brown_xs[b_peak_idx]
b_peak_y = brown_ys[b_peak_idx]
print(f"BROWN PEAK:  x={b_peak_x}, y={b_peak_y} (this is the highest brown pixel)")

print(f"\nImage center x = {w//2}")
print(f"Yellow peak is {'LEFT' if y_peak_x < w//2 else 'RIGHT'} of center (offset {abs(y_peak_x - w//2)}px)")
print(f"Brown peak is  {'LEFT' if b_peak_x < w//2 else 'RIGHT'} of center (offset {abs(b_peak_x - w//2)}px)")
print(f"Yellow peak height = {y_peak_y}")
print(f"Brown peak height  = {b_peak_y}")
if y_peak_y < b_peak_y:
    print(f"→ YELLOW peak is HIGHER (taller) by {b_peak_y - y_peak_y}px")
elif b_peak_y < y_peak_y:
    print(f"→ BROWN peak is HIGHER (taller) by {y_peak_y - b_peak_y}px")
else:
    print("→ Both peaks are the SAME height")

# ============================================================
# Find the VALLEY between the two peaks (if it exists)
# ============================================================
print("\n" + "="*70)
print("VALLEY ANALYSIS — is there a dip between the two peaks?")
print("="*70)

# Look at the row just below both peaks, see if there's a gap in the middle
for check_y in range(min(y_peak_y, b_peak_y), max(y_peak_y, b_peak_y) + 20):
    row_yellow = yellow_mask[check_y, :]
    row_brown = brown_mask[check_y, :]
    row_house = row_yellow | row_brown
    # Find gaps in the middle
    house_indices = np.where(row_house)[0]
    if len(house_indices) > 0:
        # Check for internal gaps (where neither yellow nor brown)
        gaps = []
        for i in range(1, len(house_indices)):
            if house_indices[i] - house_indices[i-1] > 3:
                gaps.append((house_indices[i-1], house_indices[i], house_indices[i] - house_indices[i-1]))
        if gaps:
            print(f"  y={check_y}: found {len(gaps)} internal gap(s): {gaps[:3]}")
            break
else:
    print("  No internal gaps found — the two colors are CONTIGUOUS (touching)")

# ============================================================
# Find bottom of house (floor line)
# ============================================================
print("\n" + "="*70)
print("FLOOR LINE (bottom of house)")
print("="*70)
house_ys, house_xs = np.where(house_mask)
print(f"House bottom: y={house_ys.max()}")
print(f"House left:   x={house_xs.min()}")
print(f"House right:  x={house_xs.max()}")
print(f"House width:  {house_xs.max() - house_xs.min()}px")
print(f"House height: {house_ys.max() - house_ys.min()}px")

# ============================================================
# Find black outline pixels (the furniture + outlines)
# ============================================================
print("\n" + "="*70)
print("BLACK OUTLINES / FURNITURE")
print("="*70)
black_mask = (r < 100) & (g < 100) & (b < 100)
black_ys, black_xs = np.where(black_mask)
print(f"Black pixels: {len(black_xs)}")
print(f"Black x range: {black_xs.min()}→{black_xs.max()}")
print(f"Black y range: {black_ys.min()}→{black_ys.max()}")

# Cluster black pixels by y-band to identify furniture vs text
print("\nBlack pixel density by y-band (20px buckets):")
for y_start in range(0, h, 20):
    y_end = min(y_start + 20, h)
    count = np.sum(black_mask[y_start:y_end, :])
    bar = "#" * (count // 20)
    print(f"  y={y_start:3d}-{y_end:3d}: {count:5d} {bar}")
