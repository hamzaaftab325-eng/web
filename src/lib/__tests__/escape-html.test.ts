import { describe, it, expect } from "vitest";

import { escapeHtml, escapeHtmlFields } from "@/lib/escape-html";

describe("escapeHtml", () => {
  it("escapes < and >", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes &", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("'hello'")).toBe("&#39;hello&#39;");
  });

  it("returns empty string for null", () => {
    expect(escapeHtml(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(escapeHtml(undefined)).toBe("");
  });

  it("escapes a full XSS payload", () => {
    const payload = '<img src=x onerror=alert(1)>';
    const escaped = escapeHtml(payload);
    expect(escaped).toBe("&lt;img src=x onerror=alert(1)&gt;");
    expect(escaped).not.toContain("<");
    expect(escaped).not.toContain(">");
  });

  it("converts non-string input to string then escapes", () => {
    expect(escapeHtml(String(42))).toBe("42");
  });
});

describe("escapeHtmlFields", () => {
  it("escapes all string fields in an object", () => {
    const result = escapeHtmlFields({ name: "<b>John</b>", city: "NYC" });
    expect(result.name).toBe("&lt;b&gt;John&lt;/b&gt;");
    expect(result.city).toBe("NYC");
  });

  it("returns empty object for null", () => {
    expect(escapeHtmlFields(null)).toEqual({});
  });

  it("returns empty object for undefined", () => {
    expect(escapeHtmlFields(undefined)).toEqual({});
  });

  it("converts non-string values to string then escapes", () => {
    const result = escapeHtmlFields({ count: 42 });
    expect(result.count).toBe("42");
  });
});
