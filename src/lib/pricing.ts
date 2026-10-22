import { discountCodes, limits, shipping, type DiscountCode, type ShippingMethodId } from "@/config/site";
import { getFinish, getProduct } from "@/lib/catalog";
import type { Destination } from "@/lib/destinations";
import type { Product } from "@/config/products";
import { formatMoney } from "@/lib/money";

/**
 * Pricing is a pure function of the cart contents and the catalog, so the
 * browser can show the same numbers the server will charge. The server
 * always recomputes totals itself and ignores any price sent by the client.
 */

export type Customization = {
  /** Printed/engraved name or business name. */
  text?: string;
  /** Second line, such as a job title. */
  subtext?: string;
  /** Opaque id of a privately stored upload (never a public URL). */
  uploadId?: string;
  uploadName?: string;
};

export type CartLine = {
  /** Stable key for this exact configuration. */
  key: string;
  slug: string;
  finishId: string;
  quantity: number;
  customization?: Customization;
  destination?: Destination;
};

export type PricedLine = CartLine & {
  product: Product;
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
  return JSON.stringify([line.slug, line.finishId, line.customization ?? null, line.destination ?? null]);
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

/** Validates a single line against the catalog. Returns an error message or null. */
export function validateLine(line: CartLine): string | null {
  const product = getProduct(line.slug);
  if (!product) return "This product is no longer available.";
  if (!product.inStock) return `${product.name} is out of stock.`;
  if (!product.finishes.includes(line.finishId as never) || !getFinish(line.finishId))
    return `That finish isn't available for ${product.name}.`;
  if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > limits.maxQuantityPerLine)
    return `Quantity must be between 1 and ${limits.maxQuantityPerLine}.`;
  const c = line.customization;
  if (c && !product.customizable && (c.text || c.subtext || c.uploadId))
    return `${product.name} can't be personalized.`;
  if (c?.uploadId && !product.acceptsLogo) return `${product.name} doesn't accept logo uploads.`;
  if (c?.text && c.text.length > 40) return "Card text must be 40 characters or fewer.";
  if (c?.subtext && c.subtext.length > 40) return "Second line must be 40 characters or fewer.";
  return null;
}

export function computeTotals(
  lines: CartLine[],
  options: { shippingMethod?: ShippingMethodId; discountCode?: string | null } = {},
): Totals {
  const priced: PricedLine[] = [];
  const issues: LineIssue[] = [];

  for (const line of lines.slice(0, limits.maxLines)) {
    const error = validateLine(line);
    if (error) {
      issues.push({ key: line.key, message: error });
      continue;
    }
    const product = getProduct(line.slug)!;
    priced.push({ ...line, product, unitPrice: product.price, lineTotal: product.price * line.quantity });
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

/** Human-readable delivery estimate in business days. */
export function deliveryEstimate(methodId: ShippingMethodId, hasCustom: boolean): string {
  const method = shipping.methods.find((m) => m.id === methodId) ?? shipping.methods[0];
  const prod = shipping.productionDays[hasCustom ? "custom" : "standard"];
  return `${prod[0] + method.transitDays[0]}–${prod[1] + method.transitDays[1]} business days`;
}
