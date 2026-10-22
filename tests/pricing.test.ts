import { describe, expect, it } from "vitest";
import { computeDiscount, computeTotals, findDiscount, lineKey, type CartLine } from "@/lib/pricing";

const line = (over: Partial<CartLine> = {}): CartLine => {
  const base = { slug: "classic", finishId: "matte-black", quantity: 1, ...over };
  return { key: lineKey(base), ...base } as CartLine;
};

describe("computeTotals", () => {
  it("prices lines from the catalog, ignoring anything else", () => {
    const t = computeTotals([line({ quantity: 2 })]);
    expect(t.subtotal).toBe(3998);
    expect(t.lines[0].unitPrice).toBe(1999);
    expect(t.itemCount).toBe(2);
  });

  it("charges standard shipping below the free threshold and none above it", () => {
    expect(computeTotals([line()]).shipping).toBe(499);
    expect(computeTotals([line({ quantity: 3 })]).shipping).toBe(0); // 59.97 >= 50
    expect(computeTotals([line({ quantity: 3 })], { shippingMethod: "express" }).shipping).toBe(1499);
  });

  it("applies the free-shipping threshold after discounts", () => {
    // 3 × 19.99 = 59.97, minus 10% = 53.97 → still free
    expect(computeTotals([line({ quantity: 3 })], { discountCode: "welcome10" }).shipping).toBe(0);
    // 26.98 subtotal... below threshold
    const t = computeTotals([line({ slug: "key-tag", finishId: "signal", quantity: 3 })], { discountCode: "WELCOME10" });
    expect(t.subtotal).toBe(4497);
    expect(t.discount).toBe(450);
    expect(t.shipping).toBe(499);
    expect(t.total).toBe(4497 - 450 + 499);
  });

  it("returns no shipping for an empty cart", () => {
    const t = computeTotals([]);
    expect(t.total).toBe(0);
    expect(t.shipping).toBe(0);
  });

  it("rejects unknown products, invalid finishes and bad quantities", () => {
    const t = computeTotals([
      line({ slug: "nope" }),
      line({ finishId: "champagne" }),
      line({ quantity: 0 }),
      line({ quantity: 51 }),
      line({ quantity: 1.5 }),
    ]);
    expect(t.lines).toHaveLength(0);
    expect(t.issues).toHaveLength(5);
    expect(t.total).toBe(0);
  });

  it("rejects logo uploads on products that don't accept them", () => {
    const t = computeTotals([line({ customization: { uploadId: "a".repeat(32) + ".png" } })]);
    expect(t.issues[0].message).toMatch(/logo/);
  });
});

describe("discounts", () => {
  it("is case-insensitive and ignores unknown codes", () => {
    expect(findDiscount("welcome10")?.code).toBe("WELCOME10");
    expect(findDiscount("FAKE")).toBeNull();
    expect(computeTotals([line()], { discountCode: "FAKE" }).discountError).toBeTruthy();
  });

  it("enforces minimum subtotals for fixed discounts", () => {
    const code = findDiscount("TEAM25");
    expect(computeDiscount(10000, code)).toBe(0);
    expect(computeDiscount(15000, code)).toBe(2500);
    const t = computeTotals([line({ slug: "team-pack", finishId: "pearl-white" })], { discountCode: "TEAM25" });
    expect(t.discount).toBe(0);
    expect(t.discountError).toMatch(/150/);
  });

  it("never discounts below zero", () => {
    expect(computeDiscount(1000, { code: "X", description: "", kind: "fixed", value: 5000, active: true })).toBe(1000);
  });
});
