"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductVisual } from "@/components/card/product-visual";
import { Button, ButtonLink } from "@/components/ui/button";
import { SwatchPicker } from "@/components/shop/swatch-picker";
import { cart } from "@/lib/cart-store";
import { defaultVariant, findVariant, priceLabel, variantInStock } from "@/lib/catalog";
import type { Product } from "@/lib/types";

/**
 * Product tile. Products that need details before they can be made (custom
 * fields or packs) send shoppers to the product page instead of adding a
 * blank item to the cart.
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [variantId, setVariantId] = useState(defaultVariant(product)?.id ?? "");
  const variant = findVariant(product, variantId) ?? product.variants[0];
  const href = `/shop/${product.slug}`;
  const quickAdd = product.customFields.length === 0 || (product.customFields.length === 1 && product.customFields[0] === "profileUrl");
  const needsDetails = !quickAdd || product.unitsPerPack > 1;
  const inStock = variant ? variantInStock(variant) : false;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-card transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_24px_48px_-28px_rgba(11,11,15,0.25)] motion-reduce:hover:translate-y-0">
      <Link href={href} className="block bg-paper-2" tabIndex={-1} aria-hidden="true">
        {variant && (
          <ProductVisual
            product={product}
            variant={variant}
            text="Alex Rivera"
            subtext="Founder"
            priority={priority}
            className="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[1.05rem] font-semibold tracking-tight">
            <Link href={href} className="underline-offset-4 hover:underline">
              {product.name}
            </Link>
          </h3>
          <span className="shrink-0 text-[0.95rem] tabular-nums">{priceLabel(product)}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{product.shortDescription}</p>
        {product.variants.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <SwatchPicker variants={product.variants} value={variant?.id ?? ""} onChange={setVariantId} size="sm" label={`${product.name} color`} />
            <span className="truncate text-xs text-muted">{variant?.name}</span>
          </div>
        )}
        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <ButtonLink href={href} variant="secondary" size="sm">
            View product
          </ButtonLink>
          {product.quoteCta ? (
            <ButtonLink href="/business#quote" size="sm">
              Request a quote
            </ButtonLink>
          ) : needsDetails ? (
            <ButtonLink href={href} size="sm">
              Customize
            </ButtonLink>
          ) : (
            <Button size="sm" disabled={!inStock} onClick={() => variant && cart.add({ slug: product.slug, variantId: variant.id, quantity: 1 })}>
              {inStock ? "Add to cart" : "Unavailable"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
