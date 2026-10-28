"use server";

import { orderLookupSchema } from "@/lib/schemas";
import { statusLabels } from "@/lib/order-status";
import { getOrderByNumber, getOrderItems } from "@/lib/server/orders";
import { rateLimit } from "@/lib/server/rate-limit";

export type LookupResult =
  | { state: "idle" }
  | { state: "error"; message: string; values?: { number: string; email: string } }
  | {
      state: "found";
      order: {
        number: string;
        status: string;
        placedAt: string;
        total: number;
        items: { name: string; variant: string; quantity: number }[];
        tracking: { carrier: string | null; number: string; url: string | null } | null;
        unpaidDevOrder: boolean;
      };
    };

/**
 * Guest order lookup. Both the order number and the checkout email must
 * match, and the response is the same whether the number exists or not, so
 * the form can't be used to discover orders. Only order status details are
 * returned, never the address or payment information.
 */
export async function lookupOrder(_prev: LookupResult, formData: FormData): Promise<LookupResult> {
  const values = { number: String(formData.get("number") ?? "").trim(), email: String(formData.get("email") ?? "").trim() };
  const limit = await rateLimit("order-lookup", 10, 10 * 60_000);
  if (!limit.ok) return { state: "error", message: "Too many lookups. Please wait a few minutes and try again.", values };

  const parsed = orderLookupSchema.safeParse(values);
  if (!parsed.success) return { state: "error", message: parsed.error.issues[0]?.message ?? "Check your details.", values };

  const order = await getOrderByNumber(parsed.data.number);
  if (!order || order.email !== parsed.data.email.toLowerCase()) {
    return { state: "error", message: "We couldn't find an order with that number and email.", values };
  }
  const items = await getOrderItems(order.id);
  return {
    state: "found",
    order: {
      number: order.number,
      status: statusLabels[order.status],
      placedAt: order.created_at,
      total: order.total,
      items: items.map((i) => ({ name: i.product_name, variant: i.variant_name, quantity: i.quantity })),
      tracking: order.tracking_number ? { carrier: order.tracking_carrier, number: order.tracking_number, url: order.tracking_url } : null,
      unpaidDevOrder: order.payment_provider === "dev" && order.status === "pending_payment",
    },
  };
}
