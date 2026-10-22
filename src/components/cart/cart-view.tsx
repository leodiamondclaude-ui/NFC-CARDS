"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { shipping, type ShippingMethodId } from "@/config/site";
import { ButtonLink, Button } from "@/components/ui/button";
import { BagIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { LineDetails, LineThumb, TotalsTable } from "@/components/cart/order-summary";
import { cart, useCart, useCartReady } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { computeTotals, deliveryEstimate } from "@/lib/pricing";
import { limits } from "@/config/site";

export function CartView() {
  const ready = useCartReady();
  const { lines, discountCode } = useCart();
  const [method, setMethod] = useState<ShippingMethodId>("standard");
  const [code, setCode] = useState("");
  const totals = useMemo(() => computeTotals(lines, { shippingMethod: method, discountCode }), [lines, method, discountCode]);
  const hasCustom = totals.lines.some((l) => l.product.customizable && (l.customization?.text || l.customization?.uploadId));

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-card shadow-[0_0_0_1px_var(--line)]" aria-label="Loading cart" />;
  }

  if (!lines.length) {
    return (
      <div className="rounded-[var(--radius-card)] bg-card px-6 py-20 text-center shadow-[0_0_0_1px_var(--line)]">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper-2">
          <BagIcon size={24} />
        </span>
        <h2 className="mt-6 text-xl font-semibold tracking-tight">Your cart is empty</h2>
        <p className="mt-2 text-muted">Find a card you like, or design your own.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/shop">Shop cards</ButtonLink>
          <ButtonLink href="/customize" variant="secondary">
            Open the customizer
          </ButtonLink>
        </div>
      </div>
    );
  }

  const freeOver = shipping.methods.find((m) => m.id === "standard")?.freeOver;
  const remainingForFree = freeOver ? freeOver - (totals.subtotal - totals.discount) : 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div>
        {totals.issues.length > 0 && (
          <div role="alert" className="mb-4 rounded-2xl bg-accent-soft p-4 text-sm text-accent-ink">
            {totals.issues.map((i) => (
              <p key={i.key}>
                {i.message}{" "}
                {i.key !== "cart" && (
                  <button type="button" className="underline underline-offset-2" onClick={() => cart.remove(i.key)}>
                    Remove
                  </button>
                )}
              </p>
            ))}
          </div>
        )}
        <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-card shadow-[0_0_0_1px_var(--line)]">
          {totals.lines.map((line) => (
            <li key={line.key} className="flex gap-4 p-4 sm:p-5">
              <LineThumb line={line} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-4">
                  <Link href={`/shop/${line.slug}`} className="font-medium hover:underline underline-offset-4">
                    {line.product.name}
                  </Link>
                  <span className="tabular-nums">{formatMoney(line.lineTotal)}</span>
                </div>
                <LineDetails line={line} />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full shadow-[0_0_0_1px_var(--line-strong)]" role="group" aria-label={`Quantity for ${line.product.name}`}>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-40"
                      onClick={() => cart.setQuantity(line.key, line.quantity - 1)}
                      disabled={line.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon size={14} />
                    </button>
                    <span className="w-7 text-center text-sm tabular-nums">{line.quantity}</span>
                    <button
                      type="button"
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-40"
                      onClick={() => cart.setQuantity(line.key, line.quantity + 1)}
                      disabled={line.quantity >= limits.maxQuantityPerLine}
                      aria-label="Increase quantity"
                    >
                      <PlusIcon size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.remove(line.key)}
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-danger"
                  >
                    <TrashIcon size={14} /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside aria-label="Order summary" className="h-fit space-y-6 rounded-[var(--radius-card)] bg-card p-6 shadow-[0_0_0_1px_var(--line)] lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold tracking-tight">Summary</h2>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Shipping</legend>
          <div className="space-y-2">
            {shipping.methods.map((m) => {
              const free = m.freeOver !== undefined && totals.subtotal - totals.discount >= m.freeOver;
              return (
                <label key={m.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl p-3 text-sm shadow-[0_0_0_1px_var(--line-strong)] has-[:checked]:shadow-[0_0_0_1.5px_var(--ink)]`}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="ship" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[var(--ink)]" />
                    <span>
                      <span className="block font-medium">{m.label}</span>
                      <span className="block text-xs text-muted">{deliveryEstimate(m.id, hasCustom)}</span>
                    </span>
                  </span>
                  <span className="tabular-nums">{free ? "Free" : formatMoney(m.price)}</span>
                </label>
              );
            })}
          </div>
          {remainingForFree > 0 && (
            <p className="mt-2 text-xs text-muted">Add {formatMoney(remainingForFree)} more for free standard shipping.</p>
          )}
        </fieldset>

        <div>
          {discountCode ? (
            <div className="flex items-center justify-between rounded-xl bg-paper-2 px-3 py-2.5 text-sm">
              <span>
                Code <span className="font-mono font-medium">{discountCode}</span>
                {totals.discountError && <span className="block text-xs text-danger">{totals.discountError}</span>}
              </span>
              <button type="button" onClick={() => cart.setDiscountCode(null)} className="text-xs text-muted hover:text-ink">
                Remove
              </button>
            </div>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim()) cart.setDiscountCode(code);
                setCode("");
              }}
            >
              <label htmlFor="discount" className="sr-only">
                Discount code
              </label>
              <input id="discount" className="field py-2 text-sm uppercase" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} />
              <Button type="submit" variant="secondary" size="sm" className="h-auto">
                Apply
              </Button>
            </form>
          )}
        </div>

        <TotalsTable totals={totals} />

        <ButtonLink href={`/checkout?shipping=${method}`} size="lg" className="w-full" aria-disabled={!totals.lines.length}>
          Continue to checkout
        </ButtonLink>
        <p className="text-center text-xs text-muted">Guest checkout. No account needed.</p>
      </aside>
    </div>
  );
}
