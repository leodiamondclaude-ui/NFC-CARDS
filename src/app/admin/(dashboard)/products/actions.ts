"use server";

import { randomBytes } from "node:crypto";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { categories } from "@/config/products";
import { requireAdmin } from "@/lib/server/admin-auth";
import { addProductImage, CATALOG_TAG, readCatalog, removeProductImage, saveProduct } from "@/lib/server/catalog";
import { deleteProductImageFile, storeProductImage } from "@/lib/server/uploads";
import type { Category, CustomField, FinishId } from "@/lib/types";

export type ProductFormState = { ok?: boolean; message?: string; fieldErrors?: Record<string, string> };

const finishIds = ["black", "white", "metallic", "navy"] as const satisfies readonly FinishId[];
const customFieldIds = ["printedName", "jobTitle", "company", "profileUrl", "logo"] as const satisfies readonly CustomField[];
const categoryIds = categories.map((c) => c.id) as [Category, ...Category[]];

const variantSchema = z.object({
  id: z.string().regex(/^var_[a-z0-9_]{3,40}$/).or(z.literal("")),
  name: z.string().trim().min(1, "Each variant needs a name.").max(40),
  finish: z.enum(finishIds),
  sku: z.string().trim().min(1, "Each variant needs a SKU.").max(40).regex(/^[A-Za-z0-9-_]+$/, "SKUs use letters, numbers and dashes."),
  inventory: z.union([z.literal(""), z.coerce.number().int().min(0).max(1_000_000)]),
  available: z.boolean(),
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes."),
  category: z.enum(categoryIds),
  shortDescription: z.string().trim().min(5, "Add a short description.").max(160),
  description: z.string().trim().min(10, "Add a description.").max(3000),
  price: z.coerce.number({ error: "Enter a price." }).min(0.5, "Prices start at $0.50.").max(100000),
  startingAt: z.boolean(),
  unitsPerPack: z.coerce.number().int().min(1).max(1000),
  sortOrder: z.coerce.number().int().min(0).max(1000),
  featured: z.boolean(),
  active: z.boolean(),
  quoteCta: z.boolean(),
  customFields: z.array(z.enum(customFieldIds)),
  specs: z.string().max(4000),
  faq: z.string().max(8000),
  variants: z.array(variantSchema).min(1, "Add at least one variant.").max(12),
});

/** "Label: value" per line. */
function parseSpecs(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { label: l, value: "" };
    })
    .slice(0, 30);
}

/** "Question | Answer" per line. */
function parseFaq(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes("|"))
    .map((l) => {
      const [q, ...a] = l.split("|");
      return { q: q.trim(), a: a.join("|").trim() };
    })
    .filter((f) => f.q && f.a)
    .slice(0, 20);
}

const newId = (prefix: string) => `${prefix}_${randomBytes(6).toString("hex")}`;

function readForm(formData: FormData) {
  const count = Math.min(Number(formData.get("variantCount")) || 0, 12);
  const variants = Array.from({ length: count }, (_, i) => ({
    id: String(formData.get(`variants.${i}.id`) ?? ""),
    name: formData.get(`variants.${i}.name`),
    finish: formData.get(`variants.${i}.finish`),
    sku: formData.get(`variants.${i}.sku`),
    inventory: String(formData.get(`variants.${i}.inventory`) ?? "").trim(),
    available: formData.get(`variants.${i}.available`) === "on",
  })).filter((v) => v.name !== null);
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    price: formData.get("price"),
    startingAt: formData.get("startingAt") === "on",
    unitsPerPack: formData.get("unitsPerPack") || 1,
    sortOrder: formData.get("sortOrder") || 0,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    quoteCta: formData.get("quoteCta") === "on",
    customFields: formData.getAll("customFields"),
    specs: String(formData.get("specs") ?? ""),
    faq: String(formData.get("faq") ?? ""),
    variants,
  };
}

export async function saveProductAction(productId: string | null, _prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] ??= issue.message;
    return { ok: false, message: "Check the highlighted fields.", fieldErrors };
  }
  const d = parsed.data;
  const catalog = await readCatalog();
  const existing = productId ? catalog.find((p) => p.id === productId) : undefined;
  if (productId && !existing) return { ok: false, message: "This product no longer exists." };
  if (catalog.some((p) => p.slug === d.slug && p.id !== productId)) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: { slug: "Another product uses this URL slug." } };
  }
  const skus = d.variants.map((v) => v.sku.toUpperCase());
  const otherSkus = new Set(catalog.filter((p) => p.id !== productId).flatMap((p) => p.variants.map((v) => v.sku.toUpperCase())));
  if (new Set(skus).size !== skus.length || skus.some((s) => otherSkus.has(s))) {
    return { ok: false, message: "Check the highlighted fields.", fieldErrors: { variants: "Each SKU must be unique." } };
  }
  const ownVariantIds = new Set(existing?.variants.map((v) => v.id));

  const id = existing?.id ?? newId("prod");
  await saveProduct(
    {
      id,
      slug: d.slug,
      name: d.name,
      category: d.category,
      shortDescription: d.shortDescription,
      description: d.description,
      price: Math.round(d.price * 100),
      startingAt: d.startingAt,
      unitsPerPack: d.unitsPerPack,
      sortOrder: d.sortOrder,
      featured: d.featured,
      active: d.active,
      quoteCta: d.quoteCta,
      customFields: d.customFields,
      specs: parseSpecs(d.specs),
      faq: parseFaq(d.faq),
      variants: d.variants.map((v) => ({
        // Only keep ids that belong to this product; anything else becomes a new variant.
        id: v.id && ownVariantIds.has(v.id) ? v.id : newId("var"),
        name: v.name,
        finish: v.finish,
        sku: v.sku.toUpperCase(),
        inventory: v.inventory === "" ? null : v.inventory,
        available: v.available,
      })),
    },
    !existing,
  );
  updateTag(CATALOG_TAG);
  if (!existing) redirect(`/admin/products/${id}?created=1`);
  return { ok: true, message: "Product saved. The store is updated." };
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = (await readCatalog()).find((p) => p.id === id);
  if (!product) return;
  await saveProduct({ ...product, active: !product.active }, false);
  updateTag(CATALOG_TAG);
}

export type ImageState = { ok?: boolean; message?: string };

export async function uploadProductImageAction(productId: string, _prev: ImageState, formData: FormData): Promise<ImageState> {
  await requireAdmin();
  const product = (await readCatalog()).find((p) => p.id === productId);
  if (!product) return { ok: false, message: "Product not found." };
  if (product.images.length >= 8) return { ok: false, message: "A product can have up to 8 photos." };
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose an image to upload." };
  const alt = z.string().trim().max(160).safeParse(String(formData.get("alt") ?? ""));
  const stored = await storeProductImage(file);
  if (!stored.ok) return { ok: false, message: stored.error };
  await addProductImage(product.id, {
    id: newId("img"),
    url: stored.url,
    alt: (alt.success && alt.data) || product.name,
    storagePath: stored.id,
  });
  updateTag(CATALOG_TAG);
  return { ok: true, message: "Photo added." };
}

export async function removeProductImageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("imageId") ?? "");
  if (!/^img_[a-f0-9]{12}$/.test(id)) return;
  const row = await removeProductImage(id);
  if (row?.storage_path) await deleteProductImageFile(String(row.storage_path));
  updateTag(CATALOG_TAG);
}
