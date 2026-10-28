"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { categories } from "@/config/products";
import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/motion/reveal";
import { ViewTransition } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { filterProducts, sorts, type Sort } from "@/lib/filter";
import type { Product } from "@/lib/types";

/** Search, category filter and sorting, kept in the URL so results can be shared and survive refresh. */
export function ShopBrowser({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const category = params.get("category") ?? "";
  const sortParam = params.get("sort") as Sort | null;
  const sort: Sort = sorts.some((s) => s.id === sortParam) ? sortParam! : "featured";
  const [q, setQ] = useState(params.get("q") ?? "");

  const results = useMemo(() => filterProducts(products, { q, category, sort }), [products, q, category, sort]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const active = Boolean(category || q || sort !== "featured");

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Category">
          {[{ id: "", label: "All" }, ...categories].map((c) => {
            const on = category === c.id;
            return (
              <button
                key={c.id || "all"}
                type="button"
                aria-pressed={on}
                onClick={() => update("category", c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${on ? "bg-ink text-paper" : "border border-line bg-card text-ink-2 hover:border-line-strong hover:text-ink"}`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-64">
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="shop-search"
              type="search"
              value={q}
              placeholder="Search cards"
              onChange={(e) => {
                setQ(e.target.value);
                update("q", e.target.value);
              }}
              className="field py-2 pl-9 text-sm"
            />
          </div>
          <label htmlFor="shop-sort" className="sr-only">
            Sort by
          </label>
          <select id="shop-sort" value={sort} onChange={(e) => update("sort", e.target.value === "featured" ? "" : e.target.value)} className="field w-auto py-2 text-sm">
            {sorts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 mt-5 flex items-center justify-between text-sm text-muted">
        <p aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"}
          {pending && " · updating"}
        </p>
        {active && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="inline-flex items-center gap-1 hover:text-ink"
          >
            <CloseIcon size={14} /> Clear filters
          </button>
        )}
      </div>

      {results.length ? (
        <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" stagger={80}>
          {results.map((p, i) => (
            // Cards slide into their new places when filters or sorting change.
            <ViewTransition key={p.id} enter="card-in" exit="card-out" update="card-move" default="none">
              <div data-reveal-item className="grid">
                <ProductCard product={p} priority={i < 2} />
              </div>
            </ViewTransition>
          ))}
        </Reveal>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-line bg-paper-2 p-12 text-center">
          <p className="font-medium">No products match your search.</p>
          <p className="mt-1 text-sm text-muted">Try another word or clear the filters.</p>
        </div>
      )}
    </div>
  );
}
