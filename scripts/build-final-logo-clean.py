#!/usr/bin/env python3
"""
Build the final Aura Living logo using AI-icon-source.png + clean text.
Embeds the PNG as base64 inside the SVG so it's a single self-contained file.
"""
import base64
import os
import cairosvg

ICON_PATH = "/home/z/my-project/download/aura-logos/AI-icon-source.png"
OUTPUT_SVG = "/home/z/my-project/logos/aura-living-logo.svg"
OUTPUT_PNG = "/home/z/my-project/download/aura-logos/aura-living-logo.png"

# Read icon PNG and encode as base64
with open(ICON_PATH, "rb") as f:
    icon_bytes = f.read()
icon_b64 = base64.b64encode(icon_bytes).decode("ascii")
print(f"✓ Loaded icon ({len(icon_bytes)/1024:.1f} KB, base64: {len(icon_b64)/1024:.1f} KB)")

# Build the final SVG with embedded icon + clean text
final_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 800 1000" width="800" height="1000">
  <!-- AURA LIVING — Final Logo
       Icon: AI-generated (selected as best — 8/10)
       Text: Clean SVG typography
       Self-contained: icon embedded as base64 PNG -->

  <!-- Off-white background -->
  <rect width="800" height="1000" fill="#FAF8F4"/>

  <!-- ============================================================
       ICON — AI-generated house emblem
       Original 1024x1024, displayed at 600x600, centered at top
       ============================================================ -->
  <image x="100" y="80" width="600" height="600"
         xlink:href="data:image/png;base64,{icon_b64}"
         preserveAspectRatio="xMidYMid meet"/>

  <!-- ============================================================
       WORDMARK — AURA LIVING
       Bold geometric sans-serif, tracked, centered, charcoal
       ============================================================ -->
  <text x="400" y="780"
        font-family="Avenir Next Heavy, Montserrat ExtraBold, Gilroy ExtraBold, Helvetica, Arial, sans-serif"
        font-size="68" font-weight="800"
        fill="#2E2E2E"
        text-anchor="middle"
        letter-spacing="8">AURA LIVING</text>

  <!-- Mustard accent rule -->
  <line x1="270" y1="820" x2="530" y2="820"
        stroke="#F2C66D" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Tagline -->
  <text x="400" y="865"
        font-family="Avenir Next, Montserrat, Helvetica, Arial, sans-serif"
        font-size="14" font-weight="500"
        fill="#6B5D4F"
        text-anchor="middle"
        letter-spacing="6">CONSIDERED OBJECTS FOR THE CONSIDERED HOME</text>
</svg>
'''

with open(OUTPUT_SVG, "w") as f:
    f.write(final_svg)

size_kb = os.path.getsize(OUTPUT_SVG) / 1024
print(f"✓ Final logo SVG saved: {OUTPUT_SVG}")
print(f"  Size: {size_kb:.1f} KB (self-contained, icon embedded)")

# Render to PNG for preview
cairosvg.svg2png(url=OUTPUT_SVG, write_to=OUTPUT_PNG, output_width=800)
print(f"✓ Preview PNG saved: {OUTPUT_PNG}")
print(f"  Size: {os.path.getsize(OUTPUT_PNG)/1024:.1f} KB")
