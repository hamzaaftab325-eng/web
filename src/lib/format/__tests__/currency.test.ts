import { describe, it, expect, beforeEach } from "vitest";

import { formatPrice, setCurrencySymbol, getCurrencySymbol } from "@/lib/format/currency";

describe("formatPrice", () => {
  beforeEach(() => {
    setCurrencySymbol("₨");
  });

  it("formats a simple number", () => {
    expect(formatPrice(5000)).toBe("₨5,000");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("₨0");
  });

  it("rounds decimal numbers", () => {
    expect(formatPrice(4999.99)).toBe("₨5,000");
  });

  it("formats large numbers with locale grouping", () => {
    expect(formatPrice(1500000)).toBe("₨1,500,000");
  });

  it("uses custom currency symbol", () => {
    setCurrencySymbol("$");
    expect(formatPrice(100)).toBe("$100");
  });

  it("handles negative numbers (locale adds direction mark)", () => {
    // ur-PK locale adds a left-to-right mark (\u200e) before negative sign
    const result = formatPrice(-500);
    expect(result).toContain("500");
    expect(result).toContain("-");
    expect(result).toContain("₨");
  });
});

describe("setCurrencySymbol / getCurrencySymbol", () => {
  it("returns default symbol ₨", () => {
    setCurrencySymbol("₨");
    expect(getCurrencySymbol()).toBe("₨");
  });

  it("updates and retrieves custom symbol", () => {
    setCurrencySymbol("€");
    expect(getCurrencySymbol()).toBe("€");
  });

  it("handles empty string", () => {
    setCurrencySymbol("");
    expect(getCurrencySymbol()).toBe("");
    expect(formatPrice(100)).toBe("100");
  });
});
