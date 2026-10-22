import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { stripeMode } from "@/lib/server/env";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

/** Reads the payment configuration at request time, not build time. */
async function PaymentNotice() {
  await connection();
  const mode = stripeMode();
  if (mode === "live") return null;
  if (mode === "test")
    return (
      <p className="rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent-ink">
        <strong>Test mode.</strong> Use Stripe test card 4242 4242 4242 4242. No real payment will be taken.
      </p>
    );
  return (
    <p className="rounded-lg bg-paper-2 px-3 py-2 text-xs">
      <strong>Setup required.</strong> Payments aren&apos;t connected on this site yet, so orders can&apos;t be placed. See
      the README to add Stripe test keys.
    </p>
  );
}

export default function CheckoutPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="display mb-10 text-[2.4rem] sm:text-[3rem]">Checkout</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[var(--radius-card)] bg-card" aria-label="Loading checkout" />}>
        <CheckoutForm
          paymentNotice={
            <Suspense fallback={null}>
              <PaymentNotice />
            </Suspense>
          }
        />
      </Suspense>
    </div>
  );
}
