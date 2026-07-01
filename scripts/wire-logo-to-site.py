#!/usr/bin/env python3
"""
Wire the new Aura Living logo into the live site:
1. Build header-friendly logo SVG (icon + AURA LIVING, no tagline, transparent)
2. Build footer-friendly logo SVG (white text for dark background)
3. Copy transparent icon to public/icons/
4. Replace favicon files in public/icons/
"""
import base64
import os
import shutil
from PIL import Image

ICON_PATH = "/home/z/my-project/download/aura-logos/AI-icon-transparent.png"

# ============================================================
# Step 1: Build HEADER logo SVG (compact, dark text, transparent)
# ============================================================
print("Step 1: Building header logo SVG...")

with open(ICON_PATH, "rb") as f:
    icon_bytes = f.read()
icon_b64 = base64.b64encode(icon_bytes).decode("ascii")

# Compact horizontal lockup: 360x80 viewBox (icon 70x70 + text)
header_logo_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 360 80" width="360" height="80">
  <!-- AURA LIVING — Header Logo (compact, transparent, dark text) -->
  <image x="5" y="5" width="70" height="70"
         xlink:href="data:image/png;base64,{icon_b64}"
         preserveAspectRatio="xMidYMid meet"/>
  <text x="90" y="50"
        font-family="Avenir Next Heavy, Montserrat ExtraBold, Gilroy ExtraBold, Helvetica, Arial, sans-serif"
        font-size="26" font-weight="800"
        fill="#1A1714"
        letter-spacing="3">AURA LIVING</text>
</svg>
'''

with open("/home/z/my-project/public/logo.svg", "w") as f:
    f.write(header_logo_svg)
print(f"  ✓ public/logo.svg ({os.path.getsize('/home/z/my-project/public/logo.svg')/1024:.1f} KB)")

# ============================================================
# Step 2: Build FOOTER logo SVG (white text for dark background)
# ============================================================
print("\nStep 2: Building footer logo SVG (white text)...")

footer_logo_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 360 80" width="360" height="80">
  <!-- AURA LIVING — Footer Logo (compact, transparent, white text for dark bg) -->
  <image x="5" y="5" width="70" height="70"
         xlink:href="data:image/png;base64,{icon_b64}"
         preserveAspectRatio="xMidYMid meet"/>
  <text x="90" y="50"
        font-family="Avenir Next Heavy, Montserrat ExtraBold, Gilroy ExtraBold, Helvetica, Arial, sans-serif"
        font-size="26" font-weight="800"
        fill="#FAF6EE"
        letter-spacing="3">AURA LIVING</text>
</svg>
'''

with open("/home/z/my-project/public/logo-white.svg", "w") as f:
    f.write(footer_logo_svg)
print(f"  ✓ public/logo-white.svg ({os.path.getsize('/home/z/my-project/public/logo-white.svg')/1024:.1f} KB)")

# ============================================================
# Step 3: Copy transparent icon to public/icons/
# ============================================================
print("\nStep 3: Copying transparent icon to public/icons/...")
shutil.copy(ICON_PATH, "/home/z/my-project/public/icons/aura-icon.png")
print(f"  ✓ public/icons/aura-icon.png ({os.path.getsize('/home/z/my-project/public/icons/aura-icon.png')/1024:.1f} KB)")

# ============================================================
# Step 4: Replace favicon files in public/icons/
# ============================================================
print("\nStep 4: Replacing favicon files in public/icons/...")

FAVICON_SRC = "/home/z/my-project/download/aura-logos/favicons"
FAVICON_DEST = "/home/z/my-project/public/icons"

# Remove old favicons
for f in os.listdir(FAVICON_DEST):
    if f.startswith("icon-") or f == "favicon.ico":
        os.remove(os.path.join(FAVICON_DEST, f))
        print(f"  Removed old: {f}")

# Copy new favicons with standardized names
# PWA manifest needs: icon-192.png, icon-512.png
# Browser favicon: favicon-32.png, favicon-16.png
# Apple touch: apple-touch-icon.png
favicon_mapping = {
    "favicon-16.png": "favicon-16.png",
    "favicon-32.png": "favicon-32.png",
    "favicon-48.png": "favicon-48.png",
    "favicon-192.png": "icon-192.png",  # PWA manifest
    "favicon-512.png": "icon-512.png",  # PWA manifest
    "apple-touch-icon-180.png": "apple-touch-icon.png",
    "favicon.ico": "favicon.ico",
}

for src_name, dest_name in favicon_mapping.items():
    src = os.path.join(FAVICON_SRC, src_name)
    dest = os.path.join(FAVICON_DEST, dest_name)
    if os.path.exists(src):
        shutil.copy(src, dest)
        print(f"  ✓ {dest_name} ({os.path.getsize(dest)/1024:.1f} KB)")

print(f"\n✓ All public assets updated!")
print(f"  public/logo.svg (header, dark text)")
print(f"  public/logo-white.svg (footer, white text)")
print(f"  public/icons/aura-icon.png (transparent icon)")
print(f"  public/icons/icon-192.png, icon-512.png (PWA)")
print(f"  public/icons/favicon-16/32/48.png (browser)")
print(f"  public/icons/apple-touch-icon.png (iOS)")
print(f"  public/icons/favicon.ico (legacy)")
