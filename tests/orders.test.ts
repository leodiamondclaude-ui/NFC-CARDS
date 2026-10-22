import { describe, expect, it } from "vitest";
import { canTransition } from "@/lib/order-status";
import { sniffType } from "@/lib/server/uploads";

describe("order status transitions", () => {
  it("only allows payment from pending_payment", () => {
    expect(canTransition("pending_payment", "paid")).toBe(true);
    expect(canTransition("cancelled", "paid")).toBe(false);
    expect(canTransition("shipped", "paid")).toBe(false);
  });
  it("requires payment before production or shipping", () => {
    expect(canTransition("pending_payment", "in_production")).toBe(false);
    expect(canTransition("pending_payment", "shipped")).toBe(false);
    expect(canTransition("paid", "in_production")).toBe(true);
    expect(canTransition("in_production", "shipped")).toBe(true);
  });
  it("treats cancelled and refunded as final", () => {
    expect(canTransition("refunded", "paid")).toBe(false);
    expect(canTransition("cancelled", "pending_payment")).toBe(false);
  });
});

describe("upload type sniffing", () => {
  it("detects real types from file bytes", () => {
    expect(sniffType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("image/png");
    expect(sniffType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffType(new TextEncoder().encode("%PDF-1.7"))).toBe("application/pdf");
    expect(sniffType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBe("image/svg+xml");
  });
  it("rejects disguised files", () => {
    expect(sniffType(new TextEncoder().encode("<html><script>alert(1)</script>"))).toBeNull();
    expect(sniffType(new TextEncoder().encode("MZ\x90\x00"))).toBeNull();
  });
});
