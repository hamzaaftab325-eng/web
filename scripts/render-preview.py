"""Render the logo preview HTML to a single PNG using Playwright."""
from playwright.sync_api import sync_playwright
import os

HTML_PATH = "/home/z/my-project/logos/preview.html"
PNG_OUT = "/home/z/my-project/download/aura-logos/ALL-logos-preview.png"

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(
        viewport={"width": 1200, "height": 2400},
        device_scale_factor=2,
    )
    page = ctx.new_page()
    page.goto(f"file://{HTML_PATH}")
    page.wait_for_load_state("networkidle")
    # Take full page screenshot
    page.screenshot(path=PNG_OUT, full_page=True)
    browser.close()

size_kb = os.path.getsize(PNG_OUT) / 1024
print(f"✓ Preview rendered: {PNG_OUT} ({size_kb:.1f} KB)")
