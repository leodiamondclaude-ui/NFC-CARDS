import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { starterProducts } from "@/config/products";
import type { CustomField, FinishId, Product, Variant } from "@/lib/types";
import { hasSupabase, isProduction } from "@/lib/server/env";
import { insertMany, list, remove, update, insert, findBy, type Row } from "@/lib/server/store";

/**
 * Catalog data access. Products live in the `products`, `product_variants`
 * and `product_images` tables (or local JSON in development). The starter
 * catalog in src/config/products.ts is copied in the first time the store is
 * empty.
 */

export const CATALOG_TAG = "catalog";

type ProductRow = Row & {
  slug: string;
  name: string;
  category: Product["category"];
  short_description: string;
  description: string;
  price: number;
  starting_at: boolean;
  units_per_pack: number;
  custom_fields: CustomField[];
  quote_cta: boolean;
  featured: boolean;
  sort_order: number;
  active: boolean;
  specs: Product["specs"];
  faq: Product["faq"];
  updated_at: string;
};

type VariantRow = Row & {
  product_id: string;
  name: string;
  finish: FinishId;
  sku: string;
  inventory: number | null;
  available: boolean;
  position: number;
};

type ImageRow = Row & { product_id: string; url: string; alt: string; position: number; storage_path: string };

function toProductRow(p: Omit<Product, "variants" | "images">): ProductRow {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    short_description: p.shortDescription,
    description: p.description,
    price: p.price,
    starting_at: p.startingAt,
    units_per_pack: p.unitsPerPack,
    custom_fields: p.customFields,
    quote_cta: p.quoteCta,
    featured: p.featured,
    sort_order: p.sortOrder,
    active: p.active,
    specs: p.specs,
    faq: p.faq,
    updated_at: p.updatedAt,
  };
}

function toVariantRow(productId: string, v: Variant, position: number): VariantRow {
  return { ...v, product_id: productId, position };
}

let seeding: Promise<void> | null = null;

async function ensureSeeded() {
  const existing = await list<ProductRow>("products", { limit: 1 });
  if (existing.length) return;
  seeding ??= (async () => {
    const now = new Date().toISOString();
    await insertMany(
      "products",
      starterProducts.map((p) => toProductRow({ ...p, updatedAt: now })),
    );
    await insertMany(
      "product_variants",
      starterProducts.flatMap((p) => p.variants.map((v, i) => toVariantRow(p.id, v, i))),
    );
  })().finally(() => {
    seeding = null;
  });
  await seeding;
}

/** Reads the full catalog (including inactive products) straight from the store. */
export async function readCatalog(): Promise<Product[]> {
  // Deployed without a database (e.g. a first Vercel deploy): serve the starter
  // catalog read-only instead of writing to the host's read-only filesystem.
  if (isProduction() && !hasSupabase()) return starterProducts.map((p) => ({ ...p, updatedAt: new Date(0).toISOString() }));
  await ensureSeeded();
  const [products, variants, images] = await Promise.all([
    list<ProductRow>("products", { order: { column: "sort_order", ascending: true } }),
    list<VariantRow>("product_variants"),
    list<ImageRow>("product_images"),
  ]);
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    shortDescription: p.short_description,
    description: p.description,
    price: p.price,
    startingAt: p.starting_at,
    unitsPerPack: p.units_per_pack,
    customFields: p.custom_fields ?? [],
    quoteCta: p.quote_cta,
    featured: p.featured,
    sortOrder: p.sort_order,
    active: p.active,
    specs: p.specs ?? [],
    faq: p.faq ?? [],
    updatedAt: p.updated_at,
    variants: variants
      .filter((v) => v.product_id === p.id)
      .sort((a, b) => a.position - b.position)
      .map(({ id, name, finish, sku, inventory, available }) => ({ id, name, finish, sku, inventory, available })),
    images: images
      .filter((i) => i.product_id === p.id)
      .sort((a, b) => a.position - b.position)
      .map(({ id, url, alt }) => ({ id, url, alt })),
  }));
}

/** Storefront catalog: active products only, cached and refreshed when an admin edits products. */
export async function getCatalog(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return (await readCatalog()).filter((p) => p.active);
}

export async function getStoreProduct(slug: string): Promise<Product | undefined> {
  return (await getCatalog()).find((p) => p.slug === slug);
}

// ---- Admin mutations (callers must check authorization first) ----

export async function saveProduct(product: Omit<Product, "images" | "updatedAt">, isNew: boolean) {
  const now = new Date().toISOString();
  const row = toProductRow({ ...product, updatedAt: now });
  if (isNew) await insert("products", row);
  else await update("products", product.id, row);

  const current = await list<VariantRow>("product_variants", { eq: { product_id: product.id } });
  const keep = new Set(product.variants.map((v) => v.id));
  for (const v of current) if (!keep.has(v.id)) await remove("product_variants", v.id);
  for (const [i, v] of product.variants.entries()) {
    const vr = toVariantRow(product.id, v, i);
    if (current.some((c) => c.id === v.id)) await update("product_variants", v.id, vr);
    else await insert("product_variants", vr);
  }
}

export async function addProductImage(productId: string, image: { id: string; url: string; alt: string; storagePath: string }) {
  const existing = await list<ImageRow>("product_images", { eq: { product_id: productId } });
  await insert<ImageRow>("product_images", {
    id: image.id,
    product_id: productId,
    url: image.url,
    alt: image.alt,
    storage_path: image.storagePath,
    position: existing.length,
  });
}

export async function removeProductImage(imageId: string) {
  const row = await findBy<ImageRow>("product_images", "id", imageId);
  await remove("product_images", imageId);
  return row;
}

/** Decrements tracked inventory after a verified payment. Never goes below zero. */
export async function decrementInventory(items: { variantId: string; quantity: number }[]) {
  for (const item of items) {
    const v = await findBy<VariantRow>("product_variants", "id", item.variantId);
    if (!v || v.inventory === null) continue;
    await update<VariantRow>("product_variants", v.id, { inventory: Math.max(0, v.inventory - item.quantity) });
  }
}
