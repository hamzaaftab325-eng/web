import { describe, it, expect } from "vitest";

import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyTokenWithType,
  sanitizeUser,
} from "@/lib/auth";

describe("hashPassword / verifyPassword", () => {
  it("hashes a password", async () => {
    const hash = await hashPassword("TestPass123!");
    expect(hash).not.toBe("TestPass123!");
    expect(hash.length).toBeGreaterThan(30);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("MyStr0ng!Pass");
    const valid = await verifyPassword("MyStr0ng!Pass", hash);
    expect(valid).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Correct123!");
    const valid = await verifyPassword("Wrong123!", hash);
    expect(valid).toBe(false);
  });

  it("generates different hashes for same password (salt)", async () => {
    const hash1 = await hashPassword("Same123!");
    const hash2 = await hashPassword("Same123!");
    expect(hash1).not.toBe(hash2);
  });
});

describe("signAccessToken / verifyToken", () => {
  const payload = { userId: "user-123", email: "test@example.com", role: "customer" };

  it("signs and verifies an access token", () => {
    const token = signAccessToken(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("user-123");
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.role).toBe("customer");
  });

  it("throws for an invalid token", () => {
    expect(() => verifyToken("invalid-token")).toThrow();
  });
});

describe("signRefreshToken / verifyTokenWithType", () => {
  const payload = { userId: "user-456", email: "admin@example.com", role: "admin" };

  it("signs a refresh token with type claim", () => {
    const token = signRefreshToken(payload);
    const decoded = verifyTokenWithType(token);
    expect(decoded.type).toBe("refresh");
    expect(decoded.userId).toBe("user-456");
  });

  it("access token does NOT have type: refresh", () => {
    const token = signAccessToken(payload);
    const decoded = verifyTokenWithType(token);
    expect(decoded.type).not.toBe("refresh");
  });
});

describe("sanitizeUser", () => {
  it("strips passwordHash from user object", () => {
    const user = {
      id: "user-1",
      email: "test@test.com",
      passwordHash: "$2a$10$secret",
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      role: "customer",
      isActive: true,
      createdAt: new Date("2024-01-01"),
    };
    const sanitized = sanitizeUser(user);
    expect(sanitized).not.toHaveProperty("passwordHash");
    expect(sanitized.id).toBe("user-1");
    expect(sanitized.email).toBe("test@test.com");
    expect(sanitized.firstName).toBe("John");
    expect(sanitized.role).toBe("customer");
    expect(sanitized.createdAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("accepts partial user (no passwordHash required)", () => {
    const sanitized = sanitizeUser({
      id: "u2",
      email: "a@b.com",
      firstName: "Jane",
      lastName: "Doe",
      phone: null,
      role: "admin",
      isActive: true,
      createdAt: new Date("2024-06-01"),
    });
    expect(sanitized.phone).toBeNull();
    expect(sanitized.role).toBe("admin");
  });
});
