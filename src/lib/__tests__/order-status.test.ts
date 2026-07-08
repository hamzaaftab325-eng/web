import { describe, it, expect } from "vitest";

import {
  ORDER_STATUSES,
  statusConfig,
  statusFlow,
  isOrderStatus,
  getStatusConfig,
  getAllowedNextStatuses,
  type OrderStatus,
} from "@/lib/order-status";

describe("ORDER_STATUSES", () => {
  it("includes all expected statuses", () => {
    expect(ORDER_STATUSES).toContain("processing");
    expect(ORDER_STATUSES).toContain("packed");
    expect(ORDER_STATUSES).toContain("shipped");
    expect(ORDER_STATUSES).toContain("delivered");
    expect(ORDER_STATUSES).toContain("cancelled");
    expect(ORDER_STATUSES).toContain("refunded");
  });

  it("has exactly 6 statuses", () => {
    expect(ORDER_STATUSES).toHaveLength(6);
  });
});

describe("statusConfig", () => {
  it("has config for every status", () => {
    for (const status of ORDER_STATUSES) {
      expect(statusConfig[status]).toBeDefined();
      expect(statusConfig[status].label).toBeTruthy();
      expect(statusConfig[status].colorClass).toBeTruthy();
      expect(statusConfig[status].dotClass).toBeTruthy();
      expect(statusConfig[status].color).toBeTruthy();
    }
  });
});

describe("statusFlow", () => {
  it("allows processing → packed, cancelled", () => {
    expect(statusFlow.processing).toContain("packed");
    expect(statusFlow.processing).toContain("cancelled");
  });

  it("allows packed → shipped, cancelled", () => {
    expect(statusFlow.packed).toContain("shipped");
    expect(statusFlow.packed).toContain("cancelled");
  });

  it("allows shipped → delivered, cancelled", () => {
    expect(statusFlow.shipped).toContain("delivered");
    expect(statusFlow.shipped).toContain("cancelled");
  });

  it("allows delivered → refunded", () => {
    expect(statusFlow.delivered).toContain("refunded");
  });

  it("cancelled is terminal (no transitions)", () => {
    expect(statusFlow.cancelled).toHaveLength(0);
  });

  it("refunded is terminal (no transitions)", () => {
    expect(statusFlow.refunded).toHaveLength(0);
  });
});

describe("isOrderStatus", () => {
  it("returns true for valid statuses", () => {
    expect(isOrderStatus("processing")).toBe(true);
    expect(isOrderStatus("delivered")).toBe(true);
    expect(isOrderStatus("cancelled")).toBe(true);
  });

  it("returns false for invalid statuses", () => {
    expect(isOrderStatus("pending")).toBe(false);
    expect(isOrderStatus("")).toBe(false);
    expect(isOrderStatus("PROCESSING")).toBe(false);
  });

  it("returns false for non-string values", () => {
    expect(isOrderStatus(123)).toBe(false);
    expect(isOrderStatus(null)).toBe(false);
    expect(isOrderStatus(undefined)).toBe(false);
  });
});

describe("getStatusConfig", () => {
  it("returns config for valid status", () => {
    const cfg = getStatusConfig("processing");
    expect(cfg.label).toBe("Processing");
    expect(cfg.colorClass).toBe("c-info");
  });

  it("returns fallback for unknown status", () => {
    const cfg = getStatusConfig("unknown");
    expect(cfg.label).toBe("unknown");
    expect(cfg.colorClass).toBe("c-ink-muted");
  });
});

describe("getAllowedNextStatuses", () => {
  it("includes current status + allowed transitions", () => {
    const next = getAllowedNextStatuses("processing" as OrderStatus);
    expect(next).toContain("processing"); // current
    expect(next).toContain("packed");
    expect(next).toContain("cancelled");
  });

  it("returns only current for terminal statuses", () => {
    const next = getAllowedNextStatuses("cancelled" as OrderStatus);
    expect(next).toEqual(["cancelled"]);
  });

  it("returns only current for refunded", () => {
    const next = getAllowedNextStatuses("refunded" as OrderStatus);
    expect(next).toEqual(["refunded"]);
  });
});
