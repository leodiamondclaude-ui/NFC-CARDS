import type { Product } from "@/lib/types";

export type Sort = "featured" | "price-asc" | "price-desc" | "name";

export const sorts: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name" },
];

/** Filters and sorts the real catalog. Used by the shop page on server and client. */
export function filterProducts(products: Product[], { q = "", category = "", sort = "featured" }: { q?: string; category?: string; sort?: Sort }) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = products.filter((p) => {
    if (category && p.category !== category) return false;
    if (!words.length) return true;
    const hay = [p.name, p.shortDescription, p.description, p.category, ...p.variants.map((v) => v.name)].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  return list.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder;
    }
  });
}
