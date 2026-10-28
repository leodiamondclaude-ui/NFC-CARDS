import { describe, expect, it } from "vitest";
import { adminNextStatuses, canTransition } from "@/lib/order-status";
import { sniffType } from "@/lib/server/uploads";

describe("order status transitions", () => {
  it("only allows payment from pending_payment", () => {
    expect(canTransition("pending_payment", "paid")).toBe(true);
    expect(canTransition("canceled", "paid")).toBe(false);
    expect(canTransition("shipped", "paid")).toBe(false);
  });
  it("requires payment before processing or shipping", () => {
    expect(canTransition("pending_payment", "processing")).toBe(false);
    expect(canTransition("pending_payment", "shipped")).toBe(false);
    expect(canTransition("paid", "processing")).toBe(true);
    expect(canTransition("processing", "shipped")).toBe(true);
    expect(canTransition("shipped", "delivered")).toBe(true);
  });
  it("treats canceled and refunded as final", () => {
    expect(canTransition("refunded", "paid")).toBe(false);
    expect(canTransition("canceled", "pending_payment")).toBe(false);
  });
  it("never lets an admin mark an order paid by hand", () => {
    expect(adminNextStatuses("pending_payment")).toEqual(["canceled"]);
  });
});

describe("upload type sniffing", () => {
  it("detects real types from file bytes", () => {
    expect(sniffType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("image/png");
    expect(sniffType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffType(new TextEncoder().encode("%PDF-1.7"))).toBe("application/pdf");
    expect(sniffType(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
  });
  it("rejects SVG, HTML and executables, whatever their name", () => {
    expect(sniffType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>'))).toBeNull();
    expect(sniffType(new TextEncoder().encode("<html><script>alert(1)</script>"))).toBeNull();
    expect(sniffType(new TextEncoder().encode("MZ\x90\x00"))).toBeNull();
  });
});
