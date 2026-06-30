#!/usr/bin/env python3
"""Convert all Aura Living logo SVGs to PNG for preview."""
import os
import cairosvg

SVG_DIR = "/home/z/my-project/logos"
PNG_DIR = "/home/z/my-project/download/aura-logos"

os.makedirs(PNG_DIR, exist_ok=True)

for filename in sorted(os.listdir(SVG_DIR)):
    if not filename.endswith(".svg"):
        continue
    svg_path = os.path.join(SVG_DIR, filename)
    png_path = os.path.join(PNG_DIR, filename.replace(".svg", ".png"))
    # Render at 2x for crisp preview
    cairosvg.svg2png(
        url=svg_path,
        write_to=png_path,
        output_width=1200,  # 2x of 600
    )
    size_kb = os.path.getsize(png_path) / 1024
    print(f"  ✓ {filename} → {os.path.basename(png_path)} ({size_kb:.1f} KB)")

print("\nAll PNGs saved to:", PNG_DIR)
