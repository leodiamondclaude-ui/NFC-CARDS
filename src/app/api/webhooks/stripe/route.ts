import type Stripe from "stripe";
import { env } from "@/lib/server/env";
import { cancelOrder, markOrderPaid } from "@/lib/server/orders";
import { getStripe } from "@/lib/server/stripe";
import { sendOrderConfirmation } from "@/lib/server/email";

/**
 * Stripe webhook. This is the only place an order becomes "paid".
 * Configure the endpoint in Stripe with these events:
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded
 *   checkout.session.async_payment_failed
 *   checkout.session.expired
 */
export async function POST(request: Request) {
  if (!env.stripeSecretKey || !env.stripeWebhookSecret) {
    return Response.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = getStripe().webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch (error) {
    console.warn("[stripe-webhook] signature verification failed", error);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (!orderId) break;
      // "completed" can arrive before funds settle for delayed payment methods.
      if (session.payment_status !== "paid") break;
      const result = await markOrderPaid(orderId, {
        amountTotal: session.amount_total ?? -1,
        currency: session.currency ?? "",
        paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null),
      });
      if (!result.ok) {
        console.error(`[stripe-webhook] could not mark order ${orderId} paid: ${result.reason}`);
        // Acknowledge so Stripe stops retrying; this needs manual review.
        break;
      }
      if (!result.alreadyPaid) {
        const sent = await sendOrderConfirmation(result.order);
        if (!sent.ok) console.warn(`[stripe-webhook] confirmation email not sent for ${result.order.number}: ${sent.reason}`);
      }
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const orderId = event.data.object.metadata?.order_id;
      if (orderId) await cancelOrder(orderId);
      break;
    }
  }

  return Response.json({ received: true });
}
