import { describe, it, expect } from "vitest";

import { slugify, uid, clamp, sleep, cn } from "@/lib/utils";

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("lowercases all characters", () => {
    expect(slugify("HELLO")).toBe("hello");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World #2024")).toBe("hello-world-2024");
  });

  it("trims leading/trailing whitespace", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles unicode characters", () => {
    expect(slugify("Café München")).toBe("caf-mnchen");
  });
});

describe("uid", () => {
  it("generates a string with prefix", () => {
    const id = uid("test");
    expect(id).toMatch(/^test_[a-z0-9]+$/);
  });

  it("uses default prefix 'id'", () => {
    const id = uid();
    expect(id).toMatch(/^id_[a-z0-9]+$/);
  });

  it("generates unique ids", () => {
    const id1 = uid();
    const id2 = uid();
    expect(id1).not.toBe(id2);
  });
});

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when value is below range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns max when value is above range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("handles equal min and max", () => {
    expect(clamp(5, 7, 7)).toBe(7);
  });

  it("handles negative ranges", () => {
    expect(clamp(-15, -20, -10)).toBe(-15);
  });
});

describe("sleep", () => {
  it("resolves after the specified time", async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40); // allow slight timing variance
  });

  it("resolves with undefined", async () => {
    const result = await sleep(1);
    expect(result).toBeUndefined();
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates Tailwind classes", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});
