import { finishes, type FinishId, type Product } from "@/config/products";

export type Sort = "popular" | "price-asc" | "price-desc" | "name";

export const sorts: { id: Sort; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name" },
];

export function filterProducts(
  products: Product[],
  { q, category, finish, sort }: { q: string; category: string; finish: string; sort: Sort },
) {
  const query = q.trim().toLowerCase();
  const list = products.filter((p) => {
    if (category && p.category !== category) return false;
    if (finish && !p.finishes.includes(finish as FinishId)) return false;
    if (query) {
      const hay = [p.name, p.tagline, p.description, p.category, ...p.finishes.map((f) => finishes[f].name)]
        .join(" ")
        .toLowerCase();
      return query.split(/\s+/).every((w) => hay.includes(w));
    }
    return true;
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
        return a.popularity - b.popularity;
    }
  });
}

