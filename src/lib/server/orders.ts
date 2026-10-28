import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { canTransition, type OrderStatus } from "@/lib/order-status";
import type { Totals } from "@/lib/pricing";
import type { CheckoutInput } from "@/lib/schemas";
import { normalizeUrl } from "@/lib/destinations";
import { findBy, insert, insertMany, insertOnce, list, update, updateWhere, type Row } from "@/lib/server/store";

export type OrderRow = Row & {
  number: string;
  email: string;
  phone: string | null;
  customer_id: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  discount: number;
  discount_code: string | null;
  shipping: number;
  total: number;
  shipping_method: string;
  shipping_address: CheckoutInput["address"];
  payment_provider: "stripe" | "dev";
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  amount_paid: number | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  updated_at: string;
};

export type OrderItemRow = Row & {
  order_id: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  variant_id: string;
  variant_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  customization: Record<string, string> | null;
};

export type CustomerRow = Row & { email: string; name: string; phone: string | null; created_at: string };

/** Unique, human-friendly, non-sequential reference (doesn't reveal order volume). */
export function newOrderNumber() {
  return `TC-${randomBytes(4).toString("hex").toUpperCase()}`;
}

async function upsertCustomer(email: string, name: string, phone: string | null): Promise<CustomerRow> {
  const existing = await findBy<CustomerRow>("customers", "email", email);
  if (existing) {
    if (existing.name !== name || (phone && existing.phone !== phone))
      await update<CustomerRow>("customers", existing.id, { name, phone: phone ?? existing.phone });
    return existing;
  }
  return insert<CustomerRow>("customers", { id: randomUUID(), email, name, phone, created_at: new Date().toISOString() });
}

/** Creates an order from server-computed totals. Status starts as pending_payment. */
export async function createOrder(input: CheckoutInput, totals: Totals, provider: "stripe" | "dev"): Promise<OrderRow> {
  const email = input.contact.email.toLowerCase();
  const phone = input.contact.phone || null;
  const customer = await upsertCustomer(email, input.address.name, phone);
  const now = new Date().toISOString();
  const order: OrderRow = {
    id: randomUUID(),
    number: newOrderNumber(),
    email,
    phone,
    customer_id: customer.id,
    status: "pending_payment",
    currency: "usd",
    subtotal: totals.subtotal,
    discount: totals.discount,
    discount_code: totals.discountCode?.code ?? null,
    shipping: totals.shipping,
    total: totals.total,
    shipping_method: totals.shippingMethod,
    shipping_address: input.address,
    payment_provider: provider,
    stripe_session_id: null,
    stripe_payment_intent: null,
    amount_paid: null,
    tracking_carrier: null,
    tracking_number: null,
    tracking_url: null,
    notes: null,
    created_at: now,
    paid_at: null,
    shipped_at: null,
    updated_at: now,
  };
  await insert("orders", order);
  await insertMany<OrderItemRow>(
    "order_items",
    totals.lines.map((l) => {
      const c = l.customization ?? {};
      const customization = Object.fromEntries(
        Object.entries({ ...c, profileUrl: c.profileUrl ? (normalizeUrl(c.profileUrl) ?? undefined) : undefined }).filter(
          ([, v]) => v,
        ),
      ) as Record<string, string>;
      return {
        id: randomUUID(),
        order_id: order.id,
        product_id: l.product.id,
        product_slug: l.slug,
        product_name: l.product.name,
        variant_id: l.variant.id,
        variant_name: l.variant.name,
        sku: l.variant.sku,
        quantity: l.quantity,
        unit_price: l.unitPrice,
        line_total: l.lineTotal,
        customization: Object.keys(customization).length ? customization : null,
      };
    }),
  );
  return order;
}

export async function attachStripeSession(orderId: string, sessionId: string) {
  return update<OrderRow>("orders", orderId, { stripe_session_id: sessionId, updated_at: new Date().toISOString() });
}

export const getOrder = (id: string) => findBy<OrderRow>("orders", "id", id);
export const getOrderBySession = (sessionId: string) => findBy<OrderRow>("orders", "stripe_session_id", sessionId);
export const getOrderByNumber = (number: string) => findBy<OrderRow>("orders", "number", number.toUpperCase());
export const getOrderItems = (orderId: string) => list<OrderItemRow>("order_items", { eq: { order_id: orderId } });

export type MarkPaidResult =
  | { ok: true; order: OrderRow; alreadyPaid: boolean }
  | { ok: false; reason: "not_found" | "amount_mismatch" | "invalid_transition" };

/**
 * Marks an order paid. Call only from a verified payment webhook. The paid
 * amount must match the total computed when the order was created, and the
 * update is conditional on the order still being pending, so duplicate or
 * concurrent events can't double-process it.
 */
export async function markOrderPaid(
  orderId: string,
  payment: { amountTotal: number; currency: string; paymentIntent: string | null },
): Promise<MarkPaidResult> {
  const order = await getOrder(orderId);
  if (!order) return { ok: false, reason: "not_found" };
  // Development orders were created without a payment session and can never become paid.
  if (order.payment_provider !== "stripe") return { ok: false, reason: "invalid_transition" };
  if (order.status !== "pending_payment") {
    return order.paid_at ? { ok: true, order, alreadyPaid: true } : { ok: false, reason: "invalid_transition" };
  }
  if (payment.amountTotal !== order.total || payment.currency.toLowerCase() !== order.currency)
    return { ok: false, reason: "amount_mismatch" };
  const now = new Date().toISOString();
  const updated = await updateWhere<OrderRow>("orders", order.id, "status", "pending_payment", {
    status: "paid",
    amount_paid: payment.amountTotal,
    stripe_payment_intent: payment.paymentIntent,
    paid_at: now,
    updated_at: now,
  });
  if (!updated) {
    const fresh = await getOrder(orderId);
    return fresh?.paid_at ? { ok: true, order: fresh, alreadyPaid: true } : { ok: false, reason: "invalid_transition" };
  }
  return { ok: true, order: updated, alreadyPaid: false };
}

/** Cancels an order that hasn't been paid (expired, abandoned or failed checkout). */
export async function cancelUnpaidOrder(orderId: string, note: string) {
  await updateWhere<OrderRow>("orders", orderId, "status", "pending_payment", {
    status: "canceled",
    notes: note,
    updated_at: new Date().toISOString(),
  });
}

/** Admin status change. Enforces the allowed transitions; "paid" can't be set by hand. */
export async function setOrderStatus(orderId: string, to: OrderStatus) {
  const order = await getOrder(orderId);
  if (!order) return { ok: false as const, error: "Order not found." };
  if (to === "paid" || !canTransition(order.status, to))
    return { ok: false as const, error: `Can't change an order from ${order.status} to ${to}.` };
  const now = new Date().toISOString();
  const updated = await updateWhere<OrderRow>("orders", orderId, "status", order.status, {
    status: to,
    updated_at: now,
    ...(to === "shipped" ? { shipped_at: now } : {}),
  });
  return updated ? { ok: true as const, order: updated } : { ok: false as const, error: "The order changed. Reload and try again." };
}

export async function setTracking(orderId: string, tracking: { carrier: string; number: string; url: string | null }) {
  return update<OrderRow>("orders", orderId, {
    tracking_carrier: tracking.carrier,
    tracking_number: tracking.number,
    tracking_url: tracking.url,
    updated_at: new Date().toISOString(),
  });
}

/** Records a processed webhook event. Returns false if it was already processed. */
export async function claimWebhookEvent(eventId: string, type: string): Promise<boolean> {
  return insertOnce("webhook_events", { id: eventId, type, processed_at: new Date().toISOString() });
}

// ---- Admin reads (callers must check authorization first) ----

export const listOrders = () => list<OrderRow>("orders", { order: { column: "created_at" } });
export const listCustomers = () => list<CustomerRow>("customers", { order: { column: "created_at" } });
export const getCustomer = (id: string) => findBy<CustomerRow>("customers", "id", id);

export async function setOrderNotes(orderId: string, notes: string) {
  return update<OrderRow>("orders", orderId, { notes: notes || null, updated_at: new Date().toISOString() });
}
