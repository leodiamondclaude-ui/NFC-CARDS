"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { shipping, type ShippingMethodId } from "@/config/site";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/shop/destination-fields";
import { LineDetails, LineThumb, TotalsTable } from "@/components/cart/order-summary";
import { InfoIcon, LockIcon } from "@/components/ui/icons";
import { useCart, useCartReady } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { computeTotals, deliveryEstimate } from "@/lib/pricing";
import type { ReactNode } from "react";

type Errors = Record<string, string | undefined>;

const countryNames: Record<(typeof shipping.countries)[number], string> = { US: "United States", CA: "Canada" };

export function CheckoutForm({ paymentNotice }: { paymentNotice: ReactNode }) {
  const params = useSearchParams();
  const ready = useCartReady();
  const { lines, discountCode } = useCart();
  const initialMethod = params.get("shipping") === "express" ? "express" : "standard";
  const [method, setMethod] = useState<ShippingMethodId>(initialMethod);
  const [form, setForm] = useState({
    email: "",
    name: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "US" as (typeof shipping.countries)[number],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    { state: "idle" } | { state: "submitting" } | { state: "error"; message: string; setup?: boolean }
  >({ state: "idle" });

  const totals = useMemo(() => computeTotals(lines, { shippingMethod: method, discountCode }), [lines, method, discountCode]);
  const hasCustom = totals.lines.some((l) => l.customization?.text || l.customization?.uploadId);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate(): Errors {
    const e: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.name.trim().length < 2) e.name = "Enter the recipient's name.";
    if (form.line1.trim().length < 3) e.line1 = "Enter a street address.";
    if (form.city.trim().length < 2) e.city = "Enter a city.";
    if (form.region.trim().length < 2) e.region = "Enter a state or province.";
    if (form.postalCode.trim().length < 3) e.postalCode = "Enter a postal code.";
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) {
      document.getElementById(`co-${Object.keys(v)[0]}`)?.focus();
      return;
    }
    setStatus({ state: "submitting" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          address: {
            name: form.name,
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            region: form.region,
            postalCode: form.postalCode,
            country: form.country,
          },
          shippingMethod: method,
          discountCode: discountCode ?? undefined,
          lines,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; setupRequired?: boolean; issues?: { message: string }[] };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setStatus({
        state: "error",
        setup: data.setupRequired,
        message: data.issues?.map((i) => i.message).join(" ") || data.error || "Something went wrong. Please try again.",
      });
    } catch {
      setStatus({ state: "error", message: "We couldn't reach the server. Check your connection and try again." });
    }
  }

  if (!ready) return <div className="h-96 animate-pulse rounded-[var(--radius-card)] bg-card" aria-label="Loading checkout" />;

  if (!totals.lines.length) {
    return (
      <div className="rounded-[var(--radius-card)] bg-card px-6 py-16 text-center shadow-[0_0_0_1px_var(--line)]">
        <h2 className="text-xl font-semibold">There&apos;s nothing to check out yet</h2>
        <p className="mt-2 text-muted">Your cart is empty.</p>
        <ButtonLink href="/shop" className="mt-6">
          Shop cards
        </ButtonLink>
      </div>
    );
  }

  const err = (k: string) => errors[k];

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-10">
        {params.get("cancelled") && (
          <div className="flex gap-3 rounded-2xl bg-paper-2 p-4 text-sm">
            <InfoIcon size={18} className="shrink-0 text-muted" />
            Payment was cancelled. You haven&apos;t been charged, and your cart is saved.
          </div>
        )}

        <section aria-labelledby="contact-h">
          <h2 id="contact-h" className="mb-4 text-lg font-semibold tracking-tight">
            Contact
          </h2>
          <Field id="co-email" label="Email" error={err("email")} hint="For your receipt and shipping updates.">
            <input id="co-email" type="email" autoComplete="email" className="field" value={form.email} onChange={set("email")} aria-invalid={!!err("email")} />
          </Field>
        </section>

        <section aria-labelledby="ship-h">
          <h2 id="ship-h" className="mb-4 text-lg font-semibold tracking-tight">
            Shipping address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="co-name" label="Full name" error={err("name")}>
                <input id="co-name" autoComplete="shipping name" className="field" value={form.name} onChange={set("name")} aria-invalid={!!err("name")} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="co-line1" label="Address" error={err("line1")}>
                <input id="co-line1" autoComplete="shipping address-line1" className="field" value={form.line1} onChange={set("line1")} aria-invalid={!!err("line1")} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="co-line2" label="Apartment, suite, etc. (optional)">
                <input id="co-line2" autoComplete="shipping address-line2" className="field" value={form.line2} onChange={set("line2")} />
              </Field>
            </div>
            <Field id="co-city" label="City" error={err("city")}>
              <input id="co-city" autoComplete="shipping address-level2" className="field" value={form.city} onChange={set("city")} aria-invalid={!!err("city")} />
            </Field>
            <Field id="co-region" label="State / province" error={err("region")}>
              <input id="co-region" autoComplete="shipping address-level1" className="field" value={form.region} onChange={set("region")} aria-invalid={!!err("region")} />
            </Field>
            <Field id="co-postalCode" label="ZIP / postal code" error={err("postalCode")}>
              <input id="co-postalCode" autoComplete="shipping postal-code" className="field" value={form.postalCode} onChange={set("postalCode")} aria-invalid={!!err("postalCode")} />
            </Field>
            <Field id="co-country" label="Country">
              <select id="co-country" autoComplete="shipping country" className="field" value={form.country} onChange={set("country")}>
                {shipping.countries.map((c) => (
                  <option key={c} value={c}>
                    {countryNames[c]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <fieldset>
          <legend className="mb-4 text-lg font-semibold tracking-tight">Shipping method</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {shipping.methods.map((m) => {
              const free = m.freeOver !== undefined && totals.subtotal - totals.discount >= m.freeOver;
              return (
                <label key={m.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-card p-4 text-sm shadow-[0_0_0_1px_var(--line-strong)] has-[:checked]:shadow-[0_0_0_1.5px_var(--ink)]">
                  <span className="flex items-center gap-3">
                    <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[var(--ink)]" />
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
        </fieldset>

        <section aria-labelledby="pay-h">
          <h2 id="pay-h" className="mb-4 text-lg font-semibold tracking-tight">
            Payment
          </h2>
          <div className="rounded-2xl bg-card p-5 text-sm leading-relaxed text-ink-2 shadow-[0_0_0_1px_var(--line)]">
            <p className="flex items-center gap-2 font-medium text-ink">
              <LockIcon size={16} /> Secure payment with Stripe
            </p>
            <p className="mt-2">
              You&apos;ll enter your card or wallet details on Stripe&apos;s secure checkout page. We never see or store your card
              number.
            </p>
            <div className="mt-3">{paymentNotice}</div>
          </div>
        </section>
      </div>

      <aside aria-label="Order summary" className="h-fit space-y-6 rounded-[var(--radius-card)] bg-card p-6 shadow-[0_0_0_1px_var(--line)] lg:sticky lg:top-24">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Order summary</h2>
          <Link href="/cart" className="text-sm text-muted hover:text-ink">
            Edit
          </Link>
        </div>
        <ul className="space-y-4">
          {totals.lines.map((l) => (
            <li key={l.key} className="flex gap-3">
              <LineThumb line={l} />
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">
                    {l.product.name} <span className="text-muted">× {l.quantity}</span>
                  </span>
                  <span className="tabular-nums">{formatMoney(l.lineTotal)}</span>
                </div>
                <LineDetails line={l} />
              </div>
            </li>
          ))}
        </ul>
        <TotalsTable totals={totals} />
        {status.state === "error" && (
          <div role="alert" className={`rounded-xl p-3 text-sm ${status.setup ? "bg-paper-2 text-ink-2" : "bg-accent-soft text-accent-ink"}`}>
            {status.message}
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={status.state === "submitting"}>
          {status.state === "submitting" ? "Starting secure checkout…" : `Pay ${formatMoney(totals.total)}`}
        </Button>
        <p className="text-center text-xs text-muted">
          By placing your order you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2">
            terms
          </Link>
          .
        </p>
      </aside>
    </form>
  );
}
