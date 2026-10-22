import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/server/env";

let client: Stripe | null = null;

/** Lazily created so builds and pages work without Stripe credentials. */
export function getStripe(): Stripe {
  if (!env.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(env.stripeSecretKey);
  return client;
}
