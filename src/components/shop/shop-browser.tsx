"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import { categories, finishes, type Product } from "@/config/products";
import { filterProducts, sorts, type Sort } from "@/lib/filter";
import { ProductCard } from "@/components/shop/product-card";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";

export function ShopBrowser({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const finish = params.get("finish") ?? "";
  const sortParam = params.get("sort") as Sort | null;
  const sort: Sort = sorts.some((s) => s.id === sortParam) ? sortParam! : "popular";

  const results = useMemo(() => filterProducts(products, { q, category, finish, sort }), [products, q, category, finish, sort]);

  const availableFinishes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.finishes))),
    [products],
  );

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const activeFilters = [category, finish, q].filter(Boolean).length;

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
      <aside aria-label="Filters" className="space-y-8 lg:sticky lg:top-24 lg:self-start">
        <div>
          <label htmlFor="search" className="mb-2 block text-sm font-medium">
            Search
          </label>
          <div className="relative">
            <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="search"
              type="search"
              defaultValue={q}
              placeholder="Metal, black, team…"
              onChange={(e) => update("q", e.target.value)}
              className="field pl-9"
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-medium">Category</legend>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
            {[{ id: "", label: "All" }, ...categories].map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id || "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update("category", c.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    active ? "bg-ink text-paper" : "bg-card text-ink-2 shadow-[0_0_0_1px_var(--line)] hover:text-ink"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-medium">Color and finish</legend>
          <div className="grid grid-cols-1 gap-1">
            {availableFinishes.map((id) => {
              const f = finishes[id];
              const active = finish === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update("finish", active ? "" : id)}
                  className={`flex items-center gap-3 rounded-xl px-2 py-1.5 text-left text-sm transition-colors ${
                    active ? "bg-card font-medium shadow-[0_0_0_1px_var(--ink)]" : "text-ink-2 hover:bg-card"
                  }`}
                >
                  <span className="h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: f.surface }} />
                  {f.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted" aria-live="polite">
            {results.length} {results.length === 1 ? "product" : "products"}
            {pending && " · updating"}
          </p>
          <div className="flex items-center gap-3">
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
                className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
              >
                <CloseIcon size={14} /> Clear filters
              </button>
            )}
            <label htmlFor="sort" className="sr-only">
              Sort by
            </label>
            <select id="sort" value={sort} onChange={(e) => update("sort", e.target.value === "popular" ? "" : e.target.value)} className="field w-auto py-2 text-sm">
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {results.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] bg-card p-12 text-center shadow-[0_0_0_1px_var(--line)]">
            <p className="font-medium">No products match those filters.</p>
            <p className="mt-1 text-sm text-muted">Try a different search or clear the filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
