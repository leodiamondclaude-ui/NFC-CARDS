import type Stripe from "stripe";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG, decrementInventory } from "@/lib/server/catalog";
import { sendOrderConfirmation } from "@/lib/server/email";
import { env } from "@/lib/server/env";
import { cancelUnpaidOrder, claimWebhookEvent, getOrderItems, markOrderPaid } from "@/lib/server/orders";
import { getStripe } from "@/lib/server/stripe";

/**
 * Stripe webhook: the only place an order becomes "paid".
 * Subscribe the endpoint to:
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded
 *   checkout.session.async_payment_failed
 *   checkout.session.expired
 *
 * Every event is verified with the signing secret, recorded by id so retries
 * and duplicates are ignored, and payment amounts are checked against the
 * order total computed by the server.
 */
export async function POST(request: Request) {
  if (!env.stripeSecretKey || !env.stripeWebhookSecret) {
    return Response.json({ error: "Webhook not configured." }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, env.stripeWebhookSecret);
  } catch (error) {
    console.warn("[stripe-webhook] signature verification failed", error);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    await handle(event);
  } catch (error) {
    // Let Stripe retry: the event wasn't recorded as processed.
    console.error(`[stripe-webhook] failed to handle ${event.type} ${event.id}`, error);
    return Response.json({ error: "Handler failed." }, { status: 500 });
  }
  return Response.json({ received: true });
}

async function handle(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      // "completed" can arrive before funds settle for delayed payment methods;
      // async_payment_succeeded follows when they do.
      if (!orderId || session.payment_status !== "paid") return;
      const result = await markOrderPaid(orderId, {
        amountTotal: session.amount_total ?? -1,
        currency: session.currency ?? "",
        paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
      });
      if (!result.ok) {
        // Acknowledge so Stripe stops retrying; this needs manual review in the admin.
        console.error(`[stripe-webhook] order ${orderId} not marked paid: ${result.reason}`);
        return;
      }
      if (result.alreadyPaid) return;
      // Only the event that actually flipped the order runs side effects.
      if (!(await claimWebhookEvent(`paid:${orderId}`, event.type))) return;
      const items = await getOrderItems(orderId);
      await decrementInventory(items.map((i) => ({ variantId: i.variant_id, quantity: i.quantity })));
      revalidateTag(CATALOG_TAG, "max");
      const sent = await sendOrderConfirmation(result.order);
      if (!sent.ok) console.warn(`[stripe-webhook] confirmation email not sent for ${result.order.number}: ${sent.reason}`);
      return;
    }
    case "checkout.session.async_payment_failed": {
      const orderId = event.data.object.metadata?.order_id;
      if (orderId) await cancelUnpaidOrder(orderId, "Payment failed");
      return;
    }
    case "checkout.session.expired": {
      const orderId = event.data.object.metadata?.order_id;
      if (orderId) await cancelUnpaidOrder(orderId, "Checkout expired before payment");
      return;
    }
  }
}
