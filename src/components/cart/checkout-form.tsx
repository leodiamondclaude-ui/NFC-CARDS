"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shipping } from "@/config/site";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, fieldAria } from "@/components/ui/field";
import { LineDetails, LineThumb, TotalsTable } from "@/components/cart/order-summary";
import { useCatalog } from "@/components/providers/catalog-provider";
import { InfoIcon, LockIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { cart, useCart, useCartReady } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import { computeTotals, deliveryEstimate, isCustomLine } from "@/lib/pricing";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/schemas";

const countryNames: Record<(typeof shipping.countries)[number], string> = { US: "United States", CA: "Canada" };

type Status = { state: "idle" } | { state: "error"; message: string; setup?: boolean };

export function CheckoutForm({ paymentNotice, devMode }: { paymentNotice: ReactNode; devMode: boolean }) {
  const params = useSearchParams();
  const ready = useCartReady();
  const catalog = useCatalog();
  const { lines, discountCode } = useCart();
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      contact: { email: "", phone: "" },
      address: { name: "", line1: "", line2: "", city: "", region: "", postalCode: "", country: "US" },
      shippingMethod: params.get("shipping") === "express" ? "express" : "standard",
    },
  });
  const method = useWatch({ control, name: "shippingMethod" });

  const totals = useMemo(() => computeTotals(lines, catalog, { shippingMethod: method, discountCode }), [lines, catalog, method, discountCode]);
  const hasCustom = totals.lines.some(isCustomLine);

  useEffect(() => {
    if (ready && totals.lines.length) track({ name: "begin_checkout", value: totals.total, items: totals.itemCount });
    // Only once per visit, after the cart has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function onSubmit(values: CheckoutFormValues) {
    setStatus({ state: "idle" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          contact: { email: values.contact.email.trim(), phone: values.contact.phone || undefined },
          address: { ...values.address, line2: values.address.line2 || undefined },
          discountCode: discountCode ?? undefined,
          // Only identifiers and options are sent. The server looks up every price itself.
          lines: lines.map(({ key, slug, variantId, quantity, customization }) => ({ key, slug, variantId, quantity, customization })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        setupRequired?: boolean;
        devMode?: boolean;
        issues?: { message: string }[];
      };
      if (res.ok && data.url) {
        if (data.devMode) cart.clear();
        window.location.assign(data.url);
        return;
      }
      setStatus({
        state: "error",
        setup: data.setupRequired,
        message:
          res.status === 429
            ? "Too many attempts. Please wait a few minutes and try again."
            : data.issues?.map((i) => i.message).join(" ") || data.error || "Something went wrong. Please try again.",
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
        <p className="mt-2 text-muted">
          {totals.issues.length ? "Some items in your cart need attention." : "Your cart is empty."}
        </p>
        <ButtonLink href={totals.issues.length ? "/cart" : "/shop"} className="mt-6">
          {totals.issues.length ? "Review cart" : "Shop NFC cards"}
        </ButtonLink>
      </div>
    );
  }

  const e = errors;
  const input = (id: string, error?: string, hint?: string) => ({ ...fieldAria(id, error, hint), className: "field" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-10 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-10">
        {params.get("canceled") && (
          <div role="status" className="flex gap-3 rounded-2xl bg-paper-2 p-4 text-sm">
            <InfoIcon size={18} className="shrink-0 text-muted" />
            Checkout was canceled. You haven&apos;t been charged, and your cart is saved.
          </div>
        )}

        <section aria-labelledby="contact-h">
          <h2 id="contact-h" className="mb-4 text-lg font-semibold tracking-tight">
            Contact
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="co-email" label="Email" error={e.contact?.email?.message} hint="For your receipt and shipping updates.">
              <input type="email" autoComplete="email" {...input("co-email", e.contact?.email?.message, "hint")} {...register("contact.email")} />
            </Field>
            <Field id="co-phone" label="Phone" optional error={e.contact?.phone?.message} hint="Only used if there's a problem with delivery.">
              <input type="tel" autoComplete="tel" {...input("co-phone", e.contact?.phone?.message, "hint")} {...register("contact.phone")} />
            </Field>
          </div>
        </section>

        <section aria-labelledby="ship-h">
          <h2 id="ship-h" className="mb-4 text-lg font-semibold tracking-tight">
            Shipping address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="co-name" label="Full name" error={e.address?.name?.message}>
                <input autoComplete="shipping name" {...input("co-name", e.address?.name?.message)} {...register("address.name")} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="co-line1" label="Address" error={e.address?.line1?.message}>
                <input autoComplete="shipping address-line1" {...input("co-line1", e.address?.line1?.message)} {...register("address.line1")} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="co-line2" label="Apartment, suite, etc." optional error={e.address?.line2?.message}>
                <input autoComplete="shipping address-line2" {...input("co-line2", e.address?.line2?.message)} {...register("address.line2")} />
              </Field>
            </div>
            <Field id="co-city" label="City" error={e.address?.city?.message}>
              <input autoComplete="shipping address-level2" {...input("co-city", e.address?.city?.message)} {...register("address.city")} />
            </Field>
            <Field id="co-region" label="State / province" error={e.address?.region?.message}>
              <input autoComplete="shipping address-level1" {...input("co-region", e.address?.region?.message)} {...register("address.region")} />
            </Field>
            <Field id="co-postal" label="ZIP / postal code" error={e.address?.postalCode?.message}>
              <input autoComplete="shipping postal-code" {...input("co-postal", e.address?.postalCode?.message)} {...register("address.postalCode")} />
            </Field>
            <Field id="co-country" label="Country">
              <select autoComplete="shipping country" {...input("co-country")} {...register("address.country")}>
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
                <label key={m.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-card p-4 text-sm shadow-[0_0_0_1px_var(--line-strong)] has-[:checked]:shadow-[0_0_0_1.5px_var(--accent)]">
                  <span className="flex items-center gap-3">
                    <input type="radio" value={m.id} {...register("shippingMethod")} className="accent-[var(--accent)]" />
                    <span>
                      <span className="block font-medium">{m.label}</span>
                      <span className="block text-xs text-muted">Estimated {deliveryEstimate(m.id, hasCustom)}</span>
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
              <LockIcon size={16} /> {devMode ? "Development checkout" : "Secure payment with Stripe"}
            </p>
            <p className="mt-2">
              {devMode
                ? "Payments aren't connected, so placing an order saves it as unpaid for testing. No card is requested and nothing is charged."
                : "You'll enter your card or wallet details on Stripe's secure checkout page. We never see or store your card number."}
            </p>
            <div className="mt-3">{paymentNotice}</div>
          </div>
        </section>
      </div>

      <aside aria-label="Order summary" className="h-fit space-y-6 rounded-[var(--radius-card)] bg-card p-6 shadow-[0_0_0_1px_var(--line)] lg:sticky lg:top-24">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Order summary</h2>
          <Link href="/cart" className="text-sm text-muted hover:text-ink">
            Edit cart
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
        {totals.issues.length > 0 && (
          <p role="alert" className="rounded-xl bg-accent-soft p-3 text-sm">
            Some items need attention. <Link href="/cart" className="underline underline-offset-2">Review your cart</Link>.
          </p>
        )}
        <TotalsTable totals={totals} />
        {status.state === "error" && (
          <div role="alert" className={`rounded-xl p-3 text-sm ${status.setup ? "bg-paper-2 text-ink-2" : "bg-danger/10 text-danger"}`}>
            {status.message}
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || totals.issues.length > 0}>
          {isSubmitting
            ? devMode
              ? "Saving test order…"
              : "Starting secure checkout…"
            : devMode
              ? "Place test order (no payment)"
              : `Pay ${formatMoney(totals.total)}`}
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
