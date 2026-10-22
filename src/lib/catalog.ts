import { finishes, products, type Finish, type Product } from "@/config/products";

/**
 * Catalog access. Reads the static config today; swap these functions for
 * database queries (see supabase/migrations) without touching the UI.
 */

export function getAllProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured).sort((a, b) => a.popularity - b.popularity);
}

export function getRelatedProducts(slug: string, count = 3): Product[] {
  const current = getProduct(slug);
  return products
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const sameA = a.category === current?.category ? 0 : 1;
      const sameB = b.category === current?.category ? 0 : 1;
      return sameA - sameB || a.popularity - b.popularity;
    })
    .slice(0, count);
}

export function getFinish(id: string): Finish | undefined {
  return (finishes as Record<string, Finish>)[id];
}

export function productFinishes(product: Product): Finish[] {
  return product.finishes.map((id) => finishes[id]);
}

/** Custom-printed products need artwork before they can be produced. */
export function needsArtwork(product: Product): boolean {
  return product.category === "custom" || product.category === "teams";
}
