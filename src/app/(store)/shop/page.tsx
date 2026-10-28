import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/config/site";
import { getCatalog } from "@/lib/server/catalog";
import { filterProducts } from "@/lib/filter";
import { PageHero } from "@/components/ui/section";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { ProductCard } from "@/components/shop/product-card";
import { InfoIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Shop NFC cards",
  description: "Browse TAPCARD NFC business cards: Essential, Premium, Custom and Business Pack.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const products = await getCatalog();
  return (
    <>
      <PageHero eyebrow="Shop" title="Find your card." body="Every card is set up with your link before it ships. Prices in USD." />
      <section className="container-page py-12">
        {site.sampleCatalogNotice && (
          <p className="mb-8 flex items-start gap-2 rounded-xl bg-paper-2 px-4 py-3 text-sm text-ink-2">
            <InfoIcon size={16} className="mt-0.5 shrink-0 text-muted" />
            Sample catalog: products, prices and specifications are placeholders and will be confirmed before launch.
          </p>
        )}
        {/* Filters come from the URL, which is only known at request time; the full grid is the static fallback. */}
        <Suspense
          fallback={
            <div className="grid gap-5 pt-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filterProducts(products, {}).map((p) => (
                <ProductCard key={p.id} product={p} />
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
