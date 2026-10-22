import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProducts } from "@/lib/catalog";
import { PageHero } from "@/components/ui/section";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { filterProducts } from "@/lib/filter";
import { ProductCard } from "@/components/shop/product-card";

export const metadata: Metadata = {
  title: "Shop NFC cards",
  description: "Classic, metal, bamboo and fully custom NFC cards, plus team packs and key tags.",
};

export default function ShopPage() {
  const products = getAllProducts();
  return (
    <>
      <PageHero
        eyebrow="Shop"
        title="Find your card."
        body="Every card is programmed and tested before it ships. Prices shown are in USD."
      />
      <section className="container-page py-14">
        {/* Filters live in the URL, which is only known at request time; the full grid is the static fallback. */}
        <Suspense
          fallback={
            <div className="grid gap-5 sm:grid-cols-2 lg:ml-[17.5rem] xl:grid-cols-3">
              {filterProducts(products, { q: "", category: "", finish: "", sort: "popular" }).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          }
        >
          <ShopBrowser products={products} />
        </Suspense>
      </section>
    </>
  );
}
