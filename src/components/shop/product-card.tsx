"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { finishes as allFinishes, type Product } from "@/config/products";
import { CardArt } from "@/components/card/card-art";
import { Button, ButtonLink } from "@/components/ui/button";
import { CloseIcon, EyeIcon } from "@/components/ui/icons";
import { SwatchPicker } from "@/components/shop/swatch-picker";
import { cart } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { needsArtwork } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const [finishId, setFinishId] = useState(product.finishes[0]);
  const finish = allFinishes[finishId];
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Close the quick view if the route is hidden while it is open.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => dialog?.close();
  }, []);

  const add = () => cart.add({ slug: product.slug, finishId, quantity: 1 });

  return (
    <article className="group relative flex flex-col rounded-[var(--radius-card)] bg-card p-3 shadow-[0_0_0_1px_var(--line)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_var(--line-strong),0_24px_48px_-28px_rgba(12,12,14,0.35)]">
      <div className="relative overflow-hidden rounded-[0.9rem] bg-paper-2">
        <Link href={`/shop/${product.slug}`} className="grid aspect-[4/3] place-items-center px-[14%]" aria-label={product.name}>
          <CardArt
            finish={finish}
            form={product.form}
            view="front"
            text={product.form === "card" ? "Alex Rivera" : undefined}
            subtext="Founder"
            className="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:-translate-y-1 group-hover:rotate-[-1.5deg]"
          />
        </Link>
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-medium text-ink opacity-100 shadow-sm backdrop-blur transition-opacity hover:bg-card md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          <EyeIcon size={14} /> Quick view
        </button>
        {product.unitsPerPack > 1 && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[0.7rem] font-medium text-paper">
            {product.unitsPerPack}-pack
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[1.02rem] font-semibold tracking-tight">
            <Link href={`/shop/${product.slug}`} className="hover:underline underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <span className="text-[0.95rem] tabular-nums">{formatMoney(product.price)}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted">{product.tagline}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <SwatchPicker
            finishIds={product.finishes}
            value={finishId}
            onChange={setFinishId}
            size="sm"
            label={`${product.name} finish`}
          />
          <span className="truncate text-xs text-muted">{finish.name}</span>
        </div>
        <div className="mt-auto flex gap-2 pt-5">
          {needsArtwork(product) ? (
            <ButtonLink href={`/shop/${product.slug}?finish=${finishId}`} size="sm" className="flex-1">
              Customize
            </ButtonLink>
          ) : (
            <Button size="sm" className="flex-1" onClick={add} disabled={!product.inStock}>
              {product.inStock ? "Add to cart" : "Sold out"}
            </Button>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${product.name} quick view`}
        className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-[1.5rem] bg-card p-0 text-ink shadow-2xl backdrop:bg-night/50 backdrop:backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className="grid md:grid-cols-2">
          <div className="grid place-items-center bg-paper-2 p-10 md:p-14">
            <CardArt finish={finish} form={product.form} view="angled" text="Alex Rivera" subtext="Founder" />
          </div>
          <div className="relative flex flex-col p-6 md:p-8">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close quick view"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full hover:bg-paper-2"
            >
              <CloseIcon size={18} />
            </button>
            <p className="eyebrow">{product.category}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{product.name}</h2>
            <p className="mt-1 text-lg tabular-nums">{formatMoney(product.price)}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-2">{product.description}</p>
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">Finish: {finish.name}</p>
              <SwatchPicker finishIds={product.finishes} value={finishId} onChange={setFinishId} label={`${product.name} finish`} />
            </div>
            <div className="mt-auto flex flex-col gap-2 pt-8 sm:flex-row">
              {needsArtwork(product) ? (
                <ButtonLink href={`/shop/${product.slug}?finish=${finishId}`} className="flex-1">
                  Customize this card
                </ButtonLink>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => {
                    add();
                    dialogRef.current?.close();
                  }}
                >
                  Add to cart
                </Button>
              )}
              <ButtonLink href={`/shop/${product.slug}`} variant="secondary" className="flex-1">
                Full details
              </ButtonLink>
            </div>
          </div>
        </div>
      </dialog>
    </article>
  );
}
