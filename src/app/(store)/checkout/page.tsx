import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { stripeMode } from "@/lib/server/env";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

function PaymentNotice({ mode }: { mode: ReturnType<typeof stripeMode> }) {
  if (mode === "live") return null;
  if (mode === "test")
    return (
      <p className="rounded-lg bg-accent-soft px-3 py-2 text-xs">
        <strong>Stripe test mode.</strong> Use test card 4242 4242 4242 4242 with any future date and CVC. No real payment
        is taken.
      </p>
    );
  if (mode === "dev")
    return (
      <p className="rounded-lg bg-accent-soft px-3 py-2 text-xs">
        <strong>Development mode.</strong> Your order will be saved as <em>Pending payment</em>. Add Stripe keys to take
        real or test payments.
      </p>
    );
  return (
    <p className="rounded-lg bg-paper-2 px-3 py-2 text-xs">
      <strong>Online payments aren&apos;t available yet.</strong> Orders can&apos;t be placed until payments are set up.
      Nothing will be charged.
    </p>
  );
}

/** Reads the payment configuration at request time, not build time. */
async function Checkout() {
  await connection();
  const mode = stripeMode();
  return <CheckoutForm devMode={mode === "dev"} paymentNotice={<PaymentNotice mode={mode} />} />;
}

export default function CheckoutPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="display mb-10 text-[2.4rem] sm:text-[3rem]">Checkout</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-[var(--radius-card)] bg-card" aria-label="Loading checkout" />}>
        <Checkout />
      </Suspense>
    </div>
  );
}
