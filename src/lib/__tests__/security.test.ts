import { describe, it, expect } from "vitest";

import { sanitizeHtml, sanitizeObject, validatePasswordStrength } from "@/lib/security";

describe("sanitizeHtml", () => {
  it("strips HTML tags", () => {
    expect(sanitizeHtml("<script>alert(1)</script>")).toBe("alert(1)");
  });

  it("strips nested tags", () => {
    expect(sanitizeHtml("<div><p>Hello</p></div>")).toBe("Hello");
  });

  it("strips self-closing tags", () => {
    expect(sanitizeHtml("Hello<br/>World")).toBe("HelloWorld");
  });

  it("trims whitespace", () => {
    expect(sanitizeHtml("  hello  ")).toBe("hello");
  });

  it("returns empty string for falsy input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("does NOT decode HTML entities (XSS prevention)", () => {
    // sanitizeHtml strips tags but doesn't decode entities
    // &lt;script&gt; has no < > to strip, so it passes through with entities intact
    expect(sanitizeHtml("&lt;script&gt;alert(1)&lt;/script&gt;")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("preserves text content with attributes", () => {
    expect(sanitizeHtml('<a href="evil.com">Click here</a>')).toBe("Click here");
  });
});

describe("sanitizeObject", () => {
  it("sanitizes string fields", () => {
    const result = sanitizeObject({ name: "<b>John</b>", age: 30 });
    expect(result.name).toBe("John");
    expect(result.age).toBe(30);
  });

  it("sanitizes nested objects", () => {
    const result = sanitizeObject({ user: { name: "<script>Jane</script>" } });
    expect(result.user.name).toBe("Jane");
  });

  it("sanitizes arrays of strings", () => {
    const result = sanitizeObject({ tags: ["<b>hot</b>", "cold"] });
    expect(result.tags).toEqual(["hot", "cold"]);
  });

  it("preserves non-string values", () => {
    const result = sanitizeObject({ num: 42, bool: true, nil: null });
    expect(result.num).toBe(42);
    expect(result.bool).toBe(true);
    expect(result.nil).toBe(null);
  });

  it("handles empty object", () => {
    const result = sanitizeObject({});
    expect(result).toEqual({});
  });
});

describe("validatePasswordStrength", () => {
  it("returns null for a strong password", () => {
    expect(validatePasswordStrength("Str0ng!Pass")).toBeNull();
  });

  it("returns error for short password", () => {
    expect(validatePasswordStrength("Ab1!")).toBe("Password must be at least 8 characters");
  });

  it("returns error for missing uppercase", () => {
    expect(validatePasswordStrength("str0ng!pass")).toBe("Password must contain at least one uppercase letter");
  });

  it("returns error for missing lowercase", () => {
    expect(validatePasswordStrength("STR0NG!PASS")).toBe("Password must contain at least one lowercase letter");
  });

  it("returns error for missing digit", () => {
    expect(validatePasswordStrength("Strong!Pass")).toBe("Password must contain at least one number");
  });

  it("returns error for missing special character", () => {
    expect(validatePasswordStrength("Str0ngPass")).toBe("Password must contain at least one special character");
  });
});
