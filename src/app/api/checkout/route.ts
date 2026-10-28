import { shipping, site } from "@/config/site";
import { computeTotals, deliveryEstimate, isCustomLine } from "@/lib/pricing";
import { checkoutSchema } from "@/lib/schemas";
import { readCatalog } from "@/lib/server/catalog";
import { devCheckoutEnabled, env, hasStripe } from "@/lib/server/env";
import { attachStripeSession, cancelUnpaidOrder, createOrder } from "@/lib/server/orders";
import { rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { getStripe } from "@/lib/server/stripe";
import type { CartLine } from "@/lib/types";

/**
 * Creates an order and (when Stripe is configured) a Stripe Checkout Session.
 *
 * Prices, availability, discounts and shipping are recomputed here from the
 * live catalog; anything price-like sent by the browser is ignored. The order
 * stays "pending_payment" until the Stripe webhook confirms payment.
 */
export async function POST(request: Request) {
  const limit = await rateLimit("checkout", 15, 10 * 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please check your details.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;

  const catalog = (await readCatalog()).filter((p) => p.active);
  const totals = computeTotals(input.lines as CartLine[], catalog, {
    shippingMethod: input.shippingMethod,
    discountCode: input.discountCode,
  });
  if (totals.issues.length) {
    return Response.json({ error: "Some items in your cart need attention.", issues: totals.issues }, { status: 409 });
  }
  if (!totals.lines.length) return Response.json({ error: "Your cart is empty." }, { status: 400 });

  if (!hasStripe()) {
    if (!devCheckoutEnabled()) {
      return Response.json(
        { error: "Online payments aren't available yet. No order was created and nothing was charged.", setupRequired: true },
        { status: 503 },
      );
    }
    // Development mode: save the order unpaid so the flow can be tested. No payment is taken.
    const order = await createOrder(input, totals, "dev");
    return Response.json({ url: `/checkout/success?order=${order.id}`, orderNumber: order.number, devMode: true });
  }

  const order = await createOrder(input, totals, "stripe");
  const method = shipping.methods.find((m) => m.id === totals.shippingMethod)!;
  const hasCustom = totals.lines.some(isCustomLine);

  try {
    const stripe = getStripe();
    const coupon =
      totals.discount > 0
        ? await stripe.coupons.create({
            amount_off: totals.discount,
            currency: site.currency,
            duration: "once",
            name: totals.discountCode?.code ?? "Discount",
            max_redemptions: 1,
          })
        : null;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: input.contact.email,
        client_reference_id: order.id,
        metadata: { order_id: order.id, order_number: order.number },
        payment_intent_data: { metadata: { order_id: order.id, order_number: order.number } },
        line_items: totals.lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: site.currency,
            unit_amount: l.unitPrice,
            product_data: {
              name: `${l.product.name} (${l.variant.name})`,
              description: [l.customization?.printedName, l.customization?.company].filter(Boolean).join(" · ").slice(0, 300) || undefined,
              metadata: { sku: l.variant.sku },
            },
          },
        })),
        discounts: coupon ? [{ coupon: coupon.id }] : undefined,
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: `${method.label} (${deliveryEstimate(method.id, hasCustom)})`,
              fixed_amount: { amount: totals.shipping, currency: site.currency },
            },
          },
        ],
        // Abandoned sessions expire after 1 hour; the webhook then cancels the unpaid order.
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
        success_url: `${env.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.siteUrl}/checkout?canceled=1`,
      },
      { idempotencyKey: `checkout-${order.id}` },
    );

    if (session.amount_total !== null && session.amount_total !== totals.total) {
      // Should never happen; refuse rather than charge a different amount.
      await stripe.checkout.sessions.expire(session.id);
      await cancelUnpaidOrder(order.id, "Stripe total did not match server total");
      return Response.json({ error: "We couldn't confirm your total. Please try again." }, { status: 500 });
    }

    await attachStripeSession(order.id, session.id);
    return Response.json({ url: session.url, orderNumber: order.number });
  } catch (error) {
    console.error("[checkout] Stripe session failed", error);
    await cancelUnpaidOrder(order.id, "Could not start Stripe Checkout");
    return Response.json({ error: "We couldn't start checkout. You haven't been charged. Please try again." }, { status: 502 });
  }
}
