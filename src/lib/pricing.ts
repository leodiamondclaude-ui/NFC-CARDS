import { discountCodes, limits, shipping, type DiscountCode, type ShippingMethodId } from "@/config/site";
import { findProduct, findVariant, variantInStock } from "@/lib/catalog";
import { normalizeUrl } from "@/lib/destinations";
import { formatMoney } from "@/lib/money";
import type { CartLine, Customization, CustomField, Product, Variant } from "@/lib/types";

/**
 * Pricing is a pure function of the cart contents and the catalog, so the
 * browser can preview the same numbers the server will charge. The server
 * always recomputes totals from its own catalog and ignores client prices.
 */

export type PricedLine = CartLine & {
  product: Product;
  variant: Variant;
  unitPrice: number;
  lineTotal: number;
};

export type LineIssue = { key: string; message: string };

export type Totals = {
  lines: PricedLine[];
  issues: LineIssue[];
  subtotal: number;
  discount: number;
  discountCode: DiscountCode | null;
  discountError: string | null;
  shippingMethod: ShippingMethodId;
  shipping: number;
  total: number;
  itemCount: number;
};

export function lineKey(line: Omit<CartLine, "key" | "quantity">): string {
  return JSON.stringify([line.slug, line.variantId, line.customization ?? null]);
}

export function findDiscount(code: string | undefined | null): DiscountCode | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  return discountCodes.find((d) => d.active && d.code === normalized) ?? null;
}

export function computeDiscount(subtotal: number, code: DiscountCode | null): number {
  if (!code) return 0;
  if (code.minSubtotal && subtotal < code.minSubtotal) return 0;
  const amount = code.kind === "percent" ? Math.round((subtotal * code.value) / 100) : code.value;
  return Math.min(amount, subtotal);
}

export function computeShipping(discountedSubtotal: number, methodId: ShippingMethodId, hasItems: boolean): number {
  if (!hasItems) return 0;
  const method = shipping.methods.find((m) => m.id === methodId) ?? shipping.methods[0];
  if (method.freeOver !== undefined && discountedSubtotal >= method.freeOver) return 0;
  return method.price;
}

const fieldOf: Record<keyof Customization, CustomField | null> = {
  printedName: "printedName",
  jobTitle: "jobTitle",
  company: "company",
  profileUrl: "profileUrl",
  logoUploadId: "logo",
  logoName: "logo",
};

/** Validates a single line against the catalog. Returns an error message or null. */
export function validateLine(line: CartLine, products: Product[]): string | null {
  const product = findProduct(products, line.slug);
  if (!product || !product.active) return "This product is no longer available.";
  const variant = findVariant(product, line.variantId);
  if (!variant || !variant.available) return `That color of ${product.name} is unavailable.`;
  if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > limits.maxQuantityPerLine)
    return `Quantity must be between 1 and ${limits.maxQuantityPerLine}.`;
  if (!variantInStock(variant, line.quantity))
    return variant.inventory
      ? `Only ${variant.inventory} of ${product.name} (${variant.name}) left.`
      : `${product.name} (${variant.name}) is out of stock.`;
  for (const [k, v] of Object.entries(line.customization ?? {}) as [keyof Customization, string | undefined][]) {
    if (!v) continue;
    const field = fieldOf[k];
    if (!field || !product.customFields.includes(field)) return `${product.name} can't be customized that way.`;
  }
  const url = line.customization?.profileUrl;
  if (url && !normalizeUrl(url)) return "The card's web address isn't valid.";
  return null;
}

export function computeTotals(
  lines: CartLine[],
  products: Product[],
  options: { shippingMethod?: ShippingMethodId; discountCode?: string | null } = {},
): Totals {
  const priced: PricedLine[] = [];
  const issues: LineIssue[] = [];

  for (const line of lines.slice(0, limits.maxLines)) {
    const error = validateLine(line, products);
    if (error) {
      issues.push({ key: line.key, message: error });
      continue;
    }
    const product = findProduct(products, line.slug)!;
    const variant = findVariant(product, line.variantId)!;
    priced.push({ ...line, product, variant, unitPrice: product.price, lineTotal: product.price * line.quantity });
  }
  if (lines.length > limits.maxLines) {
    issues.push({ key: "cart", message: `A cart can hold up to ${limits.maxLines} different items.` });
  }

  const subtotal = priced.reduce((sum, l) => sum + l.lineTotal, 0);
  const code = findDiscount(options.discountCode);
  let discountError: string | null = null;
  if (options.discountCode && !code) discountError = "That code isn't valid.";
  else if (code?.minSubtotal && subtotal < code.minSubtotal)
    discountError = `${code.code} applies to orders of ${formatMoney(code.minSubtotal)} or more.`;
  const discount = computeDiscount(subtotal, code);
  const shippingMethod = options.shippingMethod ?? "standard";
  const shippingCost = computeShipping(subtotal - discount, shippingMethod, priced.length > 0);

  return {
    lines: priced,
    issues,
    subtotal,
    discount,
    discountCode: discount > 0 ? code : null,
    discountError,
    shippingMethod,
    shipping: shippingCost,
    total: subtotal - discount + shippingCost,
    itemCount: priced.reduce((n, l) => n + l.quantity, 0),
  };
}

export function isCustomLine(line: { product: Product; customization?: Customization }) {
  const c = line.customization;
  return Boolean(c?.printedName || c?.jobTitle || c?.company || c?.logoUploadId || line.product.category !== "cards");
}

/** Human-readable delivery estimate in business days. */
export function deliveryEstimate(methodId: ShippingMethodId, hasCustom: boolean): string {
  const method = shipping.methods.find((m) => m.id === methodId) ?? shipping.methods[0];
  const prod = shipping.productionDays[hasCustom ? "custom" : "standard"];
  return `${prod[0] + method.transitDays[0]}–${prod[1] + method.transitDays[1]} business days`;
}
