import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { shipping, site } from "@/config/site";
import { getCatalog, getStoreProduct } from "@/lib/server/catalog";
import { priceLabel, productInStock, relatedProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { deliveryEstimate } from "@/lib/pricing";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { ProductCard } from "@/components/shop/product-card";
import { FaqList } from "@/components/home/faq-list";
import { RepeatIcon, ShieldIcon, TruckIcon } from "@/components/ui/icons";

export async function generateStaticParams() {
  return (await getCatalog()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: { title: `${product.name} | ${site.name}`, description: product.shortDescription, type: "website" },
  };
}

export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  // Known products are fully prerendered; products added later stream in at request time.
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-2" aria-label="Loading product">
      <div className="aspect-[4/3] animate-pulse rounded-[var(--radius-card)] bg-paper-2" />
      <div className="space-y-4">
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-paper-2" />
        <div className="h-6 w-24 animate-pulse rounded-lg bg-paper-2" />
        <div className="h-24 animate-pulse rounded-lg bg-paper-2" />
      </div>
    </div>
  );
}

async function ProductContent({ params }: { params: PageProps<"/shop/[slug]">["params"] }) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([getStoreProduct(slug), getCatalog()]);
  if (!product) notFound();

  const related = relatedProducts(catalog, product.slug);
  const custom = product.category !== "cards";
  const standard = shipping.methods.find((m) => m.id === "standard")!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: site.name },
    sku: product.variants[0]?.sku,
    ...(product.images[0] ? { image: product.images.map((i) => (i.url.startsWith("http") ? i.url : `${site.url}${i.url}`)) } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: site.currency.toUpperCase(),
      price: (product.price / 100).toFixed(2),
      availability: productInStock(product) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site.url}/shop/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-page py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
          <ol className="flex gap-2">
            <li>
              <Link href="/shop" className="hover:text-ink">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <ProductPurchase
          product={product}
          header={
            <div>
              <h1 className="display text-[2.4rem] sm:text-[3rem]">{product.name}</h1>
              <p className="mt-3 text-2xl tabular-nums">
                {priceLabel(product)}
                {product.unitsPerPack > 1 && <span className="ml-2 text-base text-muted">per pack of {product.unitsPerPack}</span>}
              </p>
              <p className="mt-5 leading-relaxed text-ink-2">{product.description}</p>
            </div>
          }
        />
      </div>

      <section className="border-t border-line bg-paper-2">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Specifications</h2>
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {product.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-[9rem_1fr] gap-4 py-3.5 text-sm">
                  <dt className="text-muted">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Shipping</h2>
            <InfoRow icon={TruckIcon} title={`Estimated delivery: ${deliveryEstimate("standard", custom)}`}>
              Standard shipping is {formatMoney(standard.price)}, free on orders over {formatMoney(standard.freeOver!)}. Express is available at checkout.
            </InfoRow>
            <InfoRow icon={ShieldIcon} title="How setup works">
              Setup depends on the product. The web address and details you enter are saved with your order.
            </InfoRow>
            <InfoRow icon={RepeatIcon} title="Update what people see">
              Point your card to a page you can edit and you can change your details any time.
            </InfoRow>
            <p className="pt-1 text-sm text-muted">
              See the{" "}
              <Link href="/shipping" className="underline underline-offset-4 hover:text-ink">
                shipping
              </Link>{" "}
              and{" "}
              <Link href="/returns" className="underline underline-offset-4 hover:text-ink">
                returns
              </Link>{" "}
              policies.
            </p>
          </div>
        </div>
      </section>

      {product.faq.length > 0 && (
        <section className="container-page grid gap-8 py-16 lg:grid-cols-[1fr_2fr]" aria-labelledby="product-faq">
          <h2 id="product-faq" className="text-xl font-semibold tracking-tight">
            Questions about the {product.name}
          </h2>
          <FaqList items={product.faq} />
        </section>
      )}

      {related.length > 0 && (
        <section className="container-page border-t border-line py-16" aria-labelledby="related">
          <h2 id="related" className="text-2xl font-semibold tracking-tight">
            You might also like
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function InfoRow({ icon: I, title, children }: { icon: typeof TruckIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-xl border border-line bg-card p-5">
      <I size={20} className="mt-0.5 shrink-0 text-accent" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{children}</p>
      </div>
    </div>
  );
}
