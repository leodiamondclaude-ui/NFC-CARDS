import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { canTransition, type OrderStatus } from "@/lib/order-status";
import type { Totals } from "@/lib/pricing";
import type { CheckoutInput } from "@/lib/schemas";
import { describeDestination } from "@/lib/destinations";
import { findBy, insert, insertMany, update } from "@/lib/server/store";

export type OrderRow = {
  id: string;
  number: string;
  email: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  discount: number;
  discount_code: string | null;
  shipping: number;
  total: number;
  shipping_method: string;
  shipping_address: CheckoutInput["address"];
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  amount_paid: number | null;
  created_at: string;
  paid_at: string | null;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_slug: string;
  product_name: string;
  finish_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  customization: unknown;
  destination: unknown;
  destination_summary: string | null;
};

function orderNumber() {
  // Short, human-friendly, not sequential (doesn't leak order volume).
  return `TF-${randomBytes(4).toString("hex").toUpperCase()}`;
}

/** Creates an order from server-computed totals. Status starts as pending_payment. */
export async function createOrder(input: CheckoutInput, totals: Totals): Promise<OrderRow> {
  const order: OrderRow = {
    id: randomUUID(),
    number: orderNumber(),
    email: input.email.toLowerCase(),
    status: "pending_payment",
    currency: "usd",
    subtotal: totals.subtotal,
    discount: totals.discount,
    discount_code: totals.discountCode?.code ?? null,
    shipping: totals.shipping,
    total: totals.total,
    shipping_method: totals.shippingMethod,
    shipping_address: input.address,
    stripe_session_id: null,
    stripe_payment_intent: null,
    amount_paid: null,
    created_at: new Date().toISOString(),
    paid_at: null,
  };
  await insert("orders", order);
  await insertMany<OrderItemRow>(
    "order_items",
    totals.lines.map((l) => ({
      id: randomUUID(),
      order_id: order.id,
      product_slug: l.slug,
      product_name: l.product.name,
      finish_id: l.finishId,
      quantity: l.quantity,
      unit_price: l.unitPrice,
      line_total: l.lineTotal,
      customization: l.customization ?? null,
      destination: l.destination ?? null,
      destination_summary: l.destination ? describeDestination(l.destination) : null,
    })),
  );
  return order;
}

export async function attachStripeSession(orderId: string, sessionId: string) {
  return update<OrderRow>("orders", orderId, { stripe_session_id: sessionId });
}

export async function getOrderBySession(sessionId: string) {
  return findBy<OrderRow>("orders", "stripe_session_id", sessionId);
}

export async function getOrder(id: string) {
  return findBy<OrderRow>("orders", "id", id);
}

export type MarkPaidResult =
  | { ok: true; order: OrderRow; alreadyPaid: boolean }
  | { ok: false; reason: "not_found" | "amount_mismatch" | "invalid_transition" };

/**
 * Marks an order paid. Call only from a verified payment webhook. The paid
 * amount must match the total we computed when the order was created.
 */
export async function markOrderPaid(
  orderId: string,
  payment: { amountTotal: number; currency: string; paymentIntent: string | null },
): Promise<MarkPaidResult> {
  const order = await getOrder(orderId);
  if (!order) return { ok: false, reason: "not_found" };
  if (order.status === "paid") return { ok: true, order, alreadyPaid: true };
  if (payment.amountTotal !== order.total || payment.currency.toLowerCase() !== order.currency)
    return { ok: false, reason: "amount_mismatch" };
  if (!canTransition(order.status, "paid")) return { ok: false, reason: "invalid_transition" };
  const updated = await update<OrderRow>("orders", order.id, {
    status: "paid",
    amount_paid: payment.amountTotal,
    stripe_payment_intent: payment.paymentIntent,
    paid_at: new Date().toISOString(),
  });
  return { ok: true, order: updated ?? order, alreadyPaid: false };
}

export async function cancelOrder(orderId: string) {
  const order = await getOrder(orderId);
  if (order && canTransition(order.status, "cancelled")) await update<OrderRow>("orders", orderId, { status: "cancelled" });
}
