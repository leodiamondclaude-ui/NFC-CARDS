import { describe, expect, it } from "vitest";
import { starterProducts } from "@/config/products";
import { computeDiscount, computeTotals, findDiscount, lineKey, validateLine } from "@/lib/pricing";
import type { CartLine, Product } from "@/lib/types";

const catalog: Product[] = starterProducts.map((p) => ({ ...p, updatedAt: "2026-01-01T00:00:00.000Z" }));

const line = (over: Partial<CartLine> = {}): CartLine => {
  const base = { slug: "essential-nfc-card", variantId: "var_essential_black", quantity: 1, ...over };
  return { key: lineKey(base), ...base } as CartLine;
};

describe("computeTotals", () => {
  it("prices lines from the catalog only", () => {
    // Extra fields a tampered browser might send are ignored.
    const tampered = { ...line({ quantity: 2 }), unitPrice: 1, price: 1 } as CartLine;
    const t = computeTotals([tampered], catalog);
    expect(t.subtotal).toBe(3998);
    expect(t.lines[0].unitPrice).toBe(1999);
    expect(t.itemCount).toBe(2);
  });

  it("uses the chosen variant", () => {
    const t = computeTotals([line({ slug: "premium-nfc-card", variantId: "var_premium_metallic" })], catalog);
    expect(t.lines[0].variant.name).toBe("Metallic");
    expect(t.subtotal).toBe(2999);
  });

  it("charges standard shipping below the free threshold and none above it", () => {
    expect(computeTotals([line()], catalog).shipping).toBe(499);
    expect(computeTotals([line({ quantity: 3 })], catalog).shipping).toBe(0); // 59.97 >= 50
    expect(computeTotals([line({ quantity: 3 })], catalog, { shippingMethod: "express" }).shipping).toBe(1499);
  });

  it("applies the free-shipping threshold after discounts", () => {
    const t = computeTotals([line({ quantity: 2 }), line({ variantId: "var_essential_white", quantity: 1 })], catalog, { discountCode: "welcome10" });
    expect(t.subtotal).toBe(5997);
    expect(t.discount).toBe(600);
    expect(t.shipping).toBe(0); // 53.97 >= 50
    const small = computeTotals([line({ quantity: 2 })], catalog, { discountCode: "WELCOME10" });
    expect(small.total).toBe(3998 - 400 + 499);
  });

  it("returns no shipping for an empty cart", () => {
    const t = computeTotals([], catalog);
    expect(t.total).toBe(0);
    expect(t.shipping).toBe(0);
  });

  it("rejects unknown products, variants from another product and bad quantities", () => {
    const t = computeTotals(
      [line({ slug: "nope" }), line({ variantId: "var_premium_metallic" }), line({ quantity: 0 }), line({ quantity: 51 }), line({ quantity: 1.5 })],
      catalog,
    );
    expect(t.lines).toHaveLength(0);
    expect(t.issues).toHaveLength(5);
    expect(t.total).toBe(0);
  });

  it("rejects inactive products, unavailable variants and out-of-stock quantities", () => {
    const edited = catalog.map((p) =>
      p.slug === "premium-nfc-card"
        ? { ...p, active: false }
        : p.slug === "essential-nfc-card"
          ? { ...p, variants: p.variants.map((v) => (v.finish === "white" ? { ...v, available: false } : { ...v, inventory: 2 })) }
          : p,
    );
    expect(validateLine(line({ slug: "premium-nfc-card", variantId: "var_premium_black" }), edited)).toMatch(/no longer available/);
    expect(validateLine(line({ variantId: "var_essential_white" }), edited)).toMatch(/unavailable/);
    expect(validateLine(line({ quantity: 3 }), edited)).toMatch(/Only 2/);
    expect(validateLine(line({ quantity: 2 }), edited)).toBeNull();
  });

  it("only accepts customization fields the product offers", () => {
    expect(validateLine(line({ customization: { logoUploadId: "a".repeat(32) + ".png" } }), catalog)).toMatch(/customized/);
    expect(validateLine(line({ customization: { profileUrl: "example.com/me" } }), catalog)).toBeNull();
    expect(validateLine(line({ customization: { profileUrl: "javascript:alert(1)" } }), catalog)).toBeTruthy();
    const custom = line({
      slug: "custom-nfc-card",
      variantId: "var_custom_white",
      customization: { printedName: "Alex Rivera", jobTitle: "Founder", company: "Rivera Studio", logoUploadId: "b".repeat(32) + ".pdf", logoName: "logo.pdf" },
    });
    expect(validateLine(custom, catalog)).toBeNull();
  });

  it("gives different keys to the same product with different customization", () => {
    expect(lineKey({ slug: "custom-nfc-card", variantId: "v", customization: { printedName: "A" } })).not.toBe(
      lineKey({ slug: "custom-nfc-card", variantId: "v", customization: { printedName: "B" } }),
    );
  });
});

describe("discounts", () => {
  it("is case-insensitive and ignores unknown codes", () => {
    expect(findDiscount("welcome10")?.code).toBe("WELCOME10");
    expect(findDiscount("FAKE")).toBeNull();
    expect(computeTotals([line()], catalog, { discountCode: "FAKE" }).discountError).toBeTruthy();
  });

  it("never discounts below zero", () => {
    expect(computeDiscount(1000, { code: "X", description: "", kind: "fixed", value: 5000, active: true })).toBe(1000);
  });
});
