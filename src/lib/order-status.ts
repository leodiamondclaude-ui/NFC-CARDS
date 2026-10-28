/** Order lifecycle. Only a verified payment webhook may move an order to "paid". */

export const orderStatuses = ["pending_payment", "paid", "processing", "shipped", "delivered", "canceled", "refunded"] as const;

export type OrderStatus = (typeof orderStatuses)[number];

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "canceled"],
  paid: ["processing", "shipped", "refunded", "canceled"],
  processing: ["shipped", "refunded", "canceled"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  canceled: [],
  refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

/** Statuses an admin may set by hand. "paid" is excluded: only the payment webhook sets it. */
export function adminNextStatuses(from: OrderStatus): OrderStatus[] {
  return transitions[from].filter((s) => s !== "paid");
}

export const statusLabels: Record<OrderStatus, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
  refunded: "Refunded",
};

/** Orders that count toward revenue (payment confirmed and not refunded). */
export const revenueStatuses: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];
