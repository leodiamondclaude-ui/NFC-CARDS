"use client";

import { ProductVisual } from "@/components/card/product-visual";
import { formatMoney } from "@/lib/money";
import type { PricedLine, Totals } from "@/lib/pricing";

export function LineThumb({ line }: { line: PricedLine }) {
  const c = line.customization;
  return (
    <div className="w-24 shrink-0 overflow-hidden rounded-xl bg-paper-2">
      <ProductVisual product={line.product} variant={line.variant} text={c?.printedName} subtext={c?.jobTitle} sizes="96px" className="px-[10%]" />
    </div>
  );
}

/** The chosen color and every customization detail, so customers can check them before paying. */
export function LineDetails({ line }: { line: PricedLine }) {
  const c = line.customization;
  const rows = [
    ["Color", line.variant.name],
    ["Name", c?.printedName],
    ["Title", c?.jobTitle],
    ["Company", c?.company],
    ["Profile link", c?.profileUrl],
    ["Logo", c?.logoName],
  ].filter((r): r is [string, string] => Boolean(r[1]));
  return (
    <ul className="mt-1 space-y-0.5 text-xs leading-relaxed text-muted">
      {rows.map(([k, v]) => (
        <li key={k} className="truncate">
          {k}: <span className="text-ink-2">{v}</span>
        </li>
      ))}
      {line.product.unitsPerPack > 1 && <li>{line.product.unitsPerPack} cards per pack</li>}
    </ul>
  );
}

export function TotalsTable({ totals, shippingLabel = "Shipping" }: { totals: Totals; shippingLabel?: string }) {
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between text-success">
          <dt>Discount ({totals.discountCode?.code})</dt>
          <dd className="tabular-nums">−{formatMoney(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted">{shippingLabel}</dt>
        <dd className="tabular-nums">{totals.shipping ? formatMoney(totals.shipping) : "Free"}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatMoney(totals.total)}</dd>
      </div>
    </dl>
  );
}
