import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { shipping, site } from "@/config/site";
import { getAllProducts, getProduct, getRelatedProducts, needsArtwork } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { deliveryEstimate } from "@/lib/pricing";
import { Configurator } from "@/components/shop/configurator";
import { ProductCard } from "@/components/shop/product-card";
import { ShieldIcon, TruckIcon, RepeatIcon, CheckIcon } from "@/components/ui/icons";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.tagline} ${product.description}`.slice(0, 160),
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: { title: `${product.name} | ${site.name}`, description: product.tagline },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product.slug);
  const custom = needsArtwork(product) || product.acceptsLogo;
  const standard = shipping.methods.find((m) => m.id === "standard")!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    sku: product.slug,
    url: `${site.url}/shop/${product.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: site.currency.toUpperCase(),
      price: (product.price / 100).toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site.url}/shop/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so catalog text can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
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

        <Configurator
          products={[product]}
          initialSlug={product.slug}
          header={
            <div>
              <p className="eyebrow">{product.category}</p>
              <h1 className="display mt-3 text-[2.4rem] sm:text-[3rem]">{product.name}</h1>
              <p className="mt-3 text-2xl tabular-nums">
                {formatMoney(product.price)}
                {product.unitsPerPack > 1 && (
                  <span className="ml-2 text-base text-muted">
                    for {product.unitsPerPack} cards ({formatMoney(Math.round(product.price / product.unitsPerPack))} each)
                  </span>
                )}
              </p>
              <p className="mt-5 leading-relaxed text-ink-2">{product.description}</p>
              <ul className="mt-5 space-y-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm">
                    <CheckIcon size={16} className="mt-0.5 shrink-0 text-accent" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          }
        />
      </div>

      <section className="border-t border-line bg-card">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Delivery and support</h2>
            <InfoRow icon={TruckIcon} title={`Arrives in about ${deliveryEstimate("standard", custom)}`}>
              Standard shipping is {formatMoney(standard.price)}, free on orders over {formatMoney(standard.freeOver!)}.
              Express is available at checkout. {custom ? "Custom designs ship after you approve the digital proof." : ""}
            </InfoRow>
            <InfoRow icon={ShieldIcon} title="Programmed and tested">
              We write your destination to the chip and test every card with a phone before it ships.
            </InfoRow>
            <InfoRow icon={RepeatIcon} title="Rewritable by default">
              Unlocked cards can be rewritten later with a free NFC app. Ask us to lock yours if you prefer.
            </InfoRow>
            <p className="pt-2 text-sm text-muted">
              Questions? See the{" "}
              <Link href="/faq" className="underline underline-offset-4 hover:text-ink">
                FAQ
              </Link>{" "}
              or the{" "}
              <Link href="/returns" className="underline underline-offset-4 hover:text-ink">
                returns policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="related">
        <h2 id="related" className="text-2xl font-semibold tracking-tight">
          You might also like
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}

function InfoRow({ icon: I, title, children }: { icon: typeof TruckIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-paper p-5 shadow-[0_0_0_1px_var(--line)]">
      <I size={20} className="mt-0.5 shrink-0 text-accent" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{children}</p>
      </div>
    </div>
  );
}
