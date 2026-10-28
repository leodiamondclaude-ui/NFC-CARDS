import type { Metadata } from "next";
import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CheckIcon, InfoIcon } from "@/components/ui/icons";
import { ClearCart } from "@/components/cart/clear-cart";
import { formatMoney } from "@/lib/money";
import { statusLabels } from "@/lib/order-status";
import { getOrder, getOrderBySession } from "@/lib/server/orders";

export const metadata: Metadata = { title: "Order status", robots: { index: false } };

/**
 * Landing page after Stripe Checkout. It only *reads* the order: payment is
 * confirmed by the webhook, never by reaching this page.
 */
async function OrderStatus({ searchParams }: { searchParams: PageProps<"/checkout/success">["searchParams"] }) {
  const { session_id, order: orderId } = await searchParams;
  const sessionId = typeof session_id === "string" && /^cs_[A-Za-z0-9_]{10,200}$/.test(session_id) ? session_id : null;
  const devId = typeof orderId === "string" && /^[0-9a-f-]{36}$/.test(orderId) ? orderId : null;
  let order = sessionId ? await getOrderBySession(sessionId) : null;
  if (!order && devId) {
    // Development orders only: real orders are looked up by their Stripe session.
    const found = await getOrder(devId);
    order = found?.payment_provider === "dev" ? found : null;
  }

  if (!order) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper-2">
          <InfoIcon size={24} />
        </span>
        <h1 className="display mt-6 text-[2.2rem]">We couldn&apos;t find that order</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          If you completed a payment, you&apos;ll receive a confirmation email shortly. Contact us if it doesn&apos;t arrive.
        </p>
        <ButtonLink href="/" className="mt-8">
          Back to home
        </ButtonLink>
      </div>
    );
  }

  const dev = order.payment_provider === "dev";
  const paid = order.status !== "pending_payment" && order.status !== "canceled";

  return (
    <div className="text-center">
      {order.status !== "canceled" && <ClearCart />}
      <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${paid ? "bg-accent text-accent-ink" : "bg-paper-2"}`}>
        {paid ? <CheckIcon size={26} /> : <InfoIcon size={24} />}
      </span>
      <h1 className="display mt-6 text-[2.2rem] sm:text-[2.8rem]">
        {dev ? "Test order saved." : paid ? "Thank you. Your order is confirmed." : order.status === "canceled" ? "This checkout was canceled." : "We're confirming your payment."}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        {dev
          ? "Development mode: no payment was taken and this order is not paid. It's saved as Pending payment so you can review it in the admin dashboard."
          : paid
            ? "We'll prepare your cards and email tracking details when they ship."
            : order.status === "canceled"
              ? "You haven't been charged. Your cart is still available if you'd like to try again."
              : "This usually takes a few seconds. Refresh this page, or watch for a confirmation email once the payment is verified."}
      </p>
      <dl className="mx-auto mt-10 max-w-sm divide-y divide-line rounded-2xl bg-card text-left text-sm shadow-[0_0_0_1px_var(--line)]">
        <div className="flex justify-between px-4 py-3">
          <dt className="text-muted">Order</dt>
          <dd className="font-mono">{order.number}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-muted">Status</dt>
          <dd>{statusLabels[order.status]}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-muted">Total</dt>
          <dd className="tabular-nums">{formatMoney(order.total)}</dd>
        </div>
      </dl>
      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/orders">Track your order</ButtonLink>
        <ButtonLink href="/shop" variant="secondary">
          Continue shopping
        </ButtonLink>
      </div>
    </div>
  );
}

export default function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <div className="container-page py-20 md:py-28">
      <Suspense fallback={<div className="mx-auto h-72 max-w-md animate-pulse rounded-[var(--radius-card)] bg-card" aria-label="Loading order" />}>
        <OrderStatus searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
