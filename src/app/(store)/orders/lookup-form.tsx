"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { formatMoney } from "@/lib/money";
import { lookupOrder, type LookupResult } from "./actions";

export function LookupForm() {
  const [result, action, pending] = useActionState(lookupOrder, { state: "idle" } as LookupResult);
  const error = result.state === "error" ? result.message : undefined;
  const values = result.state === "error" ? result.values : undefined;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <form action={action} className="h-fit space-y-5 rounded-[var(--radius-card)] border border-line bg-card p-6 md:p-8">
        <Field id="o-number" label="Order number" hint="From your confirmation, e.g. TC-1A2B3C4D.">
          <input name="number" required defaultValue={values?.number} className="field uppercase" {...fieldAria("o-number", undefined, "hint")} />
        </Field>
        <Field id="o-email" label="Email used at checkout">
          <input name="email" type="email" required autoComplete="email" defaultValue={values?.email} className="field" {...fieldAria("o-email")} />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Looking up…" : "Find my order"}
        </Button>
      </form>

      {result.state === "found" ? (
        <section aria-live="polite" className="rounded-[var(--radius-card)] border border-line bg-card p-6 md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-mono text-lg font-semibold">{result.order.number}</h2>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">{result.order.status}</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Placed {new Date(result.order.placedAt).toLocaleDateString("en-US", { dateStyle: "medium" })} · {formatMoney(result.order.total)}
          </p>
          {result.order.unpaidDevOrder && (
            <p className="mt-4 rounded-xl bg-paper-2 p-3 text-sm">This is a development test order. No payment was taken.</p>
          )}
          <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
            {result.order.items.map((i, n) => (
              <li key={n} className="flex justify-between gap-4 py-3">
                <span>
                  {i.name} <span className="text-muted">({i.variant})</span>
                </span>
                <span className="text-muted">× {i.quantity}</span>
              </li>
            ))}
          </ul>
          {result.order.tracking ? (
            <p className="mt-6 text-sm">
              Tracking: {result.order.tracking.carrier ? `${result.order.tracking.carrier} ` : ""}
              {result.order.tracking.url ? (
                <a href={result.order.tracking.url} rel="noopener noreferrer" target="_blank" className="font-mono underline underline-offset-4">
                  {result.order.tracking.number}
                </a>
              ) : (
                <span className="font-mono">{result.order.tracking.number}</span>
              )}
            </p>
          ) : (
            <p className="mt-6 text-sm text-muted">Tracking details appear here once your order ships.</p>
          )}
        </section>
      ) : (
        <div className="hidden rounded-[var(--radius-card)] border border-dashed border-line-strong p-8 text-sm text-muted lg:block">
          Enter your order number and email to see its status, items and tracking.
        </div>
      )}
    </div>
  );
}
