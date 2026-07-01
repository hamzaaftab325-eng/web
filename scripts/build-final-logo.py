#!/usr/bin/env python3
"""
Build the final Aura Living logo:
- Take the auto-traced icon SVG (preserves AI-generated look)
- Composite it with clean SVG typography (AURA LIVING wordmark)
- Output a single self-contained SVG file
"""
import os

TRACED_ICON_PATH = "/home/z/my-project/logos/ai-generated/icon-v2-traced.svg"
OUTPUT_PATH = "/home/z/my-project/logos/aura-final.svg"

# Read the traced icon SVG
with open(TRACED_ICON_PATH, "r") as f:
    traced_content = f.read()

# Extract just the <path> elements from the traced SVG (skip the wrapper)
# Find content between <svg> and </svg>
start = traced_content.find("<svg")
end = traced_content.rfind("</svg>") + 6
svg_tag_end = traced_content.find(">", start) + 1
inner_paths = traced_content[svg_tag_end:end - 6]

# Build the final composite SVG
final_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <!-- AURA LIVING — Final Logo
       Icon: AI-generated then auto-traced to SVG (preserves visual look)
       Text: Clean SVG typography (perfect, scalable)
       Background: Brand off-white #FAF8F4 -->

  <!-- Background -->
  <rect width="800" height="1000" fill="#FAF8F4"/>

  <!-- Traced icon — centered, scaled to fit 600x600 area at top -->
  <g transform="translate(100, 50) scale(0.75)">
{inner_paths}
  </g>

  <!-- Wordmark -->
  <text x="400" y="800"
        font-family="Avenir Next, Montserrat, Gilroy, Helvetica, Arial, sans-serif"
        font-size="64" font-weight="800"
        fill="#2E2E2E"
        text-anchor="middle"
        letter-spacing="8">AURA LIVING</text>

  <!-- Mustard accent rule -->
  <line x1="280" y1="840" x2="520" y2="840"
        stroke="#F2C66D" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Tagline -->
  <text x="400" y="880"
        font-family="Avenir Next, Montserrat, Helvetica, Arial, sans-serif"
        font-size="13" font-weight="500"
        fill="#2E2E2E"
        text-anchor="middle"
        letter-spacing="6">CONSIDERED OBJECTS FOR THE CONSIDERED HOME</text>
</svg>
'''

with open(OUTPUT_PATH, "w") as f:
    f.write(final_svg)

size_kb = os.path.getsize(OUTPUT_PATH) / 1024
print(f"✓ Final logo saved: {OUTPUT_PATH}")
print(f"  Size: {size_kb:.1f} KB")

# Also render to PNG for preview
import cairosvg
cairosvg.svg2png(url=OUTPUT_PATH, write_to="/home/z/my-project/logos/ai-generated/aura-final-preview.png", output_width=800)
print("✓ Preview PNG rendered")
