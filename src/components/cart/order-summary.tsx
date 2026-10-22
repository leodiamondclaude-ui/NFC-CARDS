"use client";

import { finishes, type FinishId } from "@/config/products";
import { CardArt } from "@/components/card/card-art";
import { describeDestination, destinationLabel } from "@/lib/destinations";
import { formatMoney } from "@/lib/money";
import type { PricedLine, Totals } from "@/lib/pricing";

export function LineThumb({ line }: { line: PricedLine }) {
  const finish = finishes[line.finishId as FinishId];
  return (
    <div className="grid h-20 w-24 shrink-0 place-items-center rounded-xl bg-paper-2 px-2.5">
      <CardArt finish={finish} form={line.product.form} text={line.customization?.text} subtext={line.customization?.subtext} shadow={false} />
    </div>
  );
}

export function LineDetails({ line }: { line: PricedLine }) {
  const finish = finishes[line.finishId as FinishId];
  const c = line.customization;
  return (
    <ul className="mt-1 space-y-0.5 text-xs leading-relaxed text-muted">
      <li>{finish.name}</li>
      {(c?.text || c?.subtext) && <li>On card: {[c.text, c.subtext].filter(Boolean).join(" · ")}</li>}
      {c?.uploadName && <li>Artwork: {c.uploadName}</li>}
      {line.destination ? (
        <li className="truncate">
          Tap opens ({destinationLabel(line.destination.type)}): {describeDestination(line.destination)}
        </li>
      ) : line.product.unitsPerPack > 1 ? (
        <li>Per-card setup after checkout</li>
      ) : null}
    </ul>
  );
}

export function TotalsTable({ totals }: { totals: Totals }) {
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
        <dt className="text-muted">Shipping</dt>
        <dd className="tabular-nums">{totals.shipping ? formatMoney(totals.shipping) : "Free"}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatMoney(totals.total)}</dd>
      </div>
    </dl>
  );
}
