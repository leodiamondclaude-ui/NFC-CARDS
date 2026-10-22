import { finishes, type FinishId } from "@/config/products";
import { shipping, site } from "@/config/site";
import { computeTotals, deliveryEstimate, type CartLine } from "@/lib/pricing";
import { checkoutSchema } from "@/lib/schemas";
import { env, hasStripe } from "@/lib/server/env";
import { attachStripeSession, cancelOrder, createOrder } from "@/lib/server/orders";
import { getStripe } from "@/lib/server/stripe";
import { describeDestination } from "@/lib/destinations";

/**
 * Creates an order and a Stripe Checkout Session.
 *
 * Prices, discounts and shipping are recomputed here from the catalog; any
 * amount sent by the browser is ignored. The order stays `pending_payment`
 * until the Stripe webhook confirms payment.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Please check your details.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const totals = computeTotals(input.lines as CartLine[], {
    shippingMethod: input.shippingMethod,
    discountCode: input.discountCode,
  });
  if (totals.issues.length) {
    return Response.json({ error: "Some items in your cart need attention.", issues: totals.issues }, { status: 409 });
  }
  if (!totals.lines.length) return Response.json({ error: "Your cart is empty." }, { status: 400 });

  if (!hasStripe()) {
    return Response.json(
      {
        error:
          "Payments aren't connected yet. Add STRIPE_SECRET_KEY (test mode) to enable checkout. No order was created and nothing was charged.",
        setupRequired: true,
      },
      { status: 503 },
    );
  }

  const order = await createOrder(input, totals);
  const method = shipping.methods.find((m) => m.id === totals.shippingMethod)!;
  const hasCustom = totals.lines.some((l) => l.customization?.uploadId || l.product.category === "custom" || l.product.category === "teams");

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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.email,
      client_reference_id: order.id,
      metadata: { order_id: order.id, order_number: order.number },
      payment_intent_data: { metadata: { order_id: order.id, order_number: order.number } },
      line_items: totals.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: site.currency,
          unit_amount: l.unitPrice,
          product_data: {
            name: l.product.name,
            description: [
              finishes[l.finishId as FinishId]?.name,
              l.customization?.text,
              l.destination ? `Tap opens: ${describeDestination(l.destination)}` : undefined,
            ]
              .filter(Boolean)
              .join(" · ")
              .slice(0, 500),
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
      success_url: `${env.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl}/checkout?cancelled=1`,
    });

    if (session.amount_total !== null && session.amount_total !== totals.total) {
      // Should never happen; refuse rather than charge a different amount.
      await stripe.checkout.sessions.expire(session.id);
      await cancelOrder(order.id);
      return Response.json({ error: "We couldn't confirm your total. Please try again." }, { status: 500 });
    }

    await attachStripeSession(order.id, session.id);
    return Response.json({ url: session.url, orderNumber: order.number });
  } catch (error) {
    console.error("[checkout] Stripe session failed", error);
    await cancelOrder(order.id);
    return Response.json({ error: "We couldn't start checkout. You haven't been charged. Please try again." }, { status: 502 });
  }
}
