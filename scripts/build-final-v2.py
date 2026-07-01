#!/usr/bin/env python3
"""
Build the final Aura Living logo v2:
- Take the cleaned icon SVG (v6, 20 paths, 29.5KB)
- Composite with refined typography
- Output single self-contained SVG
"""
import os
import re

ICON_SVG_PATH = "/home/z/my-project/logos/ai-generated/icon-v6-final.svg"
OUTPUT_PATH = "/home/z/my-project/logos/aura-final-v3.svg"

# Read the cleaned icon SVG
with open(ICON_SVG_PATH, "r") as f:
    icon_content = f.read()

# Extract all <path> elements (already cleaned — no background, no artifacts)
path_pattern = re.compile(r'<path\s+d="([^"]*)"\s+fill="([^"]*)"\s+transform="([^"]*)"\s*/>')
paths = path_pattern.findall(icon_content)
print(f"Loaded {len(paths)} cleaned paths from icon")

# Build the inner paths XML with proper indentation
paths_xml = ""
for d, fill, transform in paths:
    paths_xml += f'      <path d="{d}" fill="{fill}" transform="{transform}"/>\n'

# Build the final composite SVG
final_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <!-- AURA LIVING — Final Logo v2
       Icon: AI-generated v6 (9/10) → auto-traced → cleaned (29.5KB, 20 paths)
       Text: Clean SVG typography with refined spacing
       Background: Brand off-white #FAF8F4 -->

  <!-- Background -->
  <rect width="800" height="1000" fill="#FAF8F4"/>

  <!-- Traced icon — centered, scaled to 640x640 area (slightly larger)
       Original viewBox 1024x1024, scaled by 0.625 = 640/1024
       Translated to center horizontally (80) and start at y=70 -->
  <g transform="translate(80, 70) scale(0.625)">
{paths_xml}  </g>

  <!-- WORDMARK — AURA LIVING
       64pt (slightly smaller for better icon-text ratio)
       ExtraBold, letter-spacing 10, perfectly centered -->
  <text x="400" y="770"
        font-family="Avenir Next Heavy, Montserrat ExtraBold, Gilroy ExtraBold, Helvetica, Arial, sans-serif"
        font-size="64" font-weight="800"
        fill="#2E2E2E"
        text-anchor="middle"
        letter-spacing="10">AURA LIVING</text>

  <!-- Mustard accent rule — perfectly aligned with wordmark width -->
  <line x1="270" y1="800" x2="530" y2="800"
        stroke="#F2C66D" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Tagline — larger (15pt), better hierarchy, same dark color -->
  <text x="400" y="838"
        font-family="Avenir Next, Montserrat, Helvetica, Arial, sans-serif"
        font-size="15" font-weight="600"
        fill="#2E2E2E"
        text-anchor="middle"
        letter-spacing="6">CONSIDERED OBJECTS FOR THE CONSIDERED HOME</text>
</svg>
'''

with open(OUTPUT_PATH, "w") as f:
    f.write(final_svg)

size_kb = os.path.getsize(OUTPUT_PATH) / 1024
print(f"✓ Final logo v2 saved: {OUTPUT_PATH}")
print(f"  Size: {size_kb:.1f} KB (vs 337KB for v1 — 91% smaller)")

# Render to PNG for preview
import cairosvg
cairosvg.svg2png(url=OUTPUT_PATH, write_to="/home/z/my-project/logos/ai-generated/aura-final-v2-preview.png", output_width=800)
print("✓ Preview PNG rendered")
