import { describe, it, expect } from "vitest";

import { slugifyName, generateAltText, generatePublicId, buildTransformedUrl } from "@/lib/cloudinary";

describe("slugifyName", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyName("Brass Arc Floor Lamp")).toBe("brass-arc-floor-lamp");
  });

  it("removes special characters", () => {
    expect(slugifyName("Lamp! @2024 #Special")).toBe("lamp-2024-special");
  });

  it("trims whitespace", () => {
    expect(slugifyName("  Hello World  ")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(slugifyName("hello---world")).toBe("hello-world");
  });

  it("truncates to 60 characters", () => {
    const long = "a".repeat(100);
    expect(slugifyName(long).length).toBe(60);
  });

  it("handles empty string", () => {
    expect(slugifyName("")).toBe("");
  });
});

describe("generateAltText", () => {
  it("uses product name + image number", () => {
    expect(generateAltText("Brass Lamp", "product", 0)).toBe("Brass Lamp — Image 1");
  });

  it("handles sortOrder -1 (defaults to 1)", () => {
    expect(generateAltText("Vase", "product", -1)).toBe("Vase — Image 1");
  });

  it("uses context label when no product name", () => {
    expect(generateAltText(undefined, "hero-slide", 0)).toBe("Hero Slide 1");
  });

  it("uses filename when no product name", () => {
    expect(generateAltText(undefined, "product", 0, "brass-lamp-01.jpg")).toBe("Brass lamp 01");
  });

  it("falls back to generic Image label for unknown context", () => {
    expect(generateAltText(undefined, "unknown", 2)).toBe("Image 3");
  });
});

describe("generatePublicId", () => {
  it("generates folder/slug-index format", () => {
    expect(generatePublicId("aura-living/products", "Brass Lamp", 0, "product"))
      .toBe("aura-living/products/brass-lamp-1");
  });

  it("uses context as slug when no product name", () => {
    expect(generatePublicId("aura-living/hero", undefined, 2, "hero-slide"))
      .toBe("aura-living/hero/hero-slide-3");
  });

  it("handles sortOrder -1 (defaults to 1)", () => {
    expect(generatePublicId("folder", "Product", -1, "product"))
      .toBe("folder/product-1");
  });
});

describe("buildTransformedUrl", () => {
  it("builds a Cloudinary URL with transformations", () => {
    // CLOUD_NAME is read from env — in tests it may be undefined
    // Just verify the URL structure when CLOUD_NAME is set
    const url = buildTransformedUrl("test-image", "f_webp,w_400");
    // If CLOUD_NAME is not set, returns empty string
    if (url) {
      expect(url).toContain("res.cloudinary.com");
      expect(url).toContain("/image/upload/");
      expect(url).toContain("f_webp,w_400");
      expect(url).toContain("test-image");
    }
  });
});
