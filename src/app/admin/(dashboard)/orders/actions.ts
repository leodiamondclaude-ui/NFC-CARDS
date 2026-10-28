"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { normalizeUrl } from "@/lib/destinations";
import { orderStatuses } from "@/lib/order-status";
import { requireAdmin } from "@/lib/server/admin-auth";
import { sendShippingConfirmation } from "@/lib/server/email";
import { getOrder, setOrderNotes, setOrderStatus, setTracking } from "@/lib/server/orders";

export type ActionState = { ok?: boolean; message?: string };

const idSchema = z.uuid();

export async function updateStatus(orderId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(orderId);
  const status = z.enum(orderStatuses).safeParse(formData.get("status"));
  if (!id.success || !status.success) return { ok: false, message: "Choose a valid status." };
  const result = await setOrderStatus(id.data, status.data);
  revalidatePath(`/admin/orders/${id.data}`);
  return result.ok ? { ok: true, message: "Status updated." } : { ok: false, message: result.error };
}

const trackingSchema = z.object({
  carrier: z.string().trim().min(1, "Enter the carrier.").max(60),
  number: z.string().trim().min(3, "Enter the tracking number.").max(80),
  url: z.string().trim().max(500).optional(),
  notify: z.boolean(),
});

export async function saveTracking(orderId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(orderId);
  const parsed = trackingSchema.safeParse({
    carrier: formData.get("carrier"),
    number: formData.get("number"),
    url: formData.get("url") || undefined,
    notify: formData.get("notify") === "on",
  });
  if (!id.success || !parsed.success) return { ok: false, message: parsed.error?.issues[0]?.message ?? "Check the tracking details." };
  // Only http(s) links are stored, so the customer-facing link can't run script.
  const url = parsed.data.url ? normalizeUrl(parsed.data.url) : null;
  if (parsed.data.url && !url) return { ok: false, message: "The tracking link isn't a valid web address." };

  const order = await getOrder(id.data);
  if (!order) return { ok: false, message: "Order not found." };
  const updated = await setTracking(id.data, { carrier: parsed.data.carrier, number: parsed.data.number, url });
  revalidatePath(`/admin/orders/${id.data}`);
  if (!parsed.data.notify || !updated) return { ok: true, message: "Tracking saved." };
  const email = await sendShippingConfirmation(updated);
  return email.ok
    ? { ok: true, message: `Tracking saved and emailed to ${updated.email}.` }
    : { ok: true, message: `Tracking saved. The email was not sent (${email.reason}).` };
}

export async function saveNotes(orderId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(orderId);
  const notes = z.string().max(2000).safeParse(String(formData.get("notes") ?? ""));
  if (!id.success || !notes.success) return { ok: false, message: "Notes must be under 2,000 characters." };
  await setOrderNotes(id.data, notes.data.trim());
  revalidatePath(`/admin/orders/${id.data}`);
  return { ok: true, message: "Notes saved." };
}
