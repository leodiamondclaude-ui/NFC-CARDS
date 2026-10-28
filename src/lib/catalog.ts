import { finishes, type Finish } from "@/config/products";
import { formatMoney } from "@/lib/money";
import type { Product, Variant } from "@/lib/types";

/** Pure catalog helpers shared by server and client. They take the product list as input. */

export function findProduct(products: Product[], slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function findVariant(product: Product, variantId: string): Variant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

export function finishOf(variant: Variant): Finish {
  return finishes[variant.finish] ?? finishes.black;
}

/** A variant can be bought when it's available and (if stock is tracked) in stock. */
export function variantInStock(variant: Variant, quantity = 1): boolean {
  return variant.available && (variant.inventory === null || variant.inventory >= quantity);
}

export function productInStock(product: Product): boolean {
  return product.active && product.variants.some((v) => variantInStock(v));
}

export function defaultVariant(product: Product): Variant | undefined {
  return product.variants.find((v) => variantInStock(v)) ?? product.variants[0];
}

export function priceLabel(product: Product): string {
  return `${product.startingAt ? "From " : ""}${formatMoney(product.price)}`;
}

export function relatedProducts(products: Product[], slug: string, count = 3): Product[] {
  const current = findProduct(products, slug);
  return products
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const sameA = a.category === current?.category ? 0 : 1;
      const sameB = b.category === current?.category ? 0 : 1;
      return sameA - sameB || a.sortOrder - b.sortOrder;
    })
    .slice(0, count);
}
