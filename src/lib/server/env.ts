import "server-only";

/** Central place to read server configuration. See .env.example. */
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  uploadsBucket: process.env.SUPABASE_UPLOADS_BUCKET ?? "customer-uploads",
  productImagesBucket: process.env.SUPABASE_PRODUCT_IMAGES_BUCKET ?? "product-images",
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM,
  salesInbox: process.env.SALES_INBOX,
  dataDir: process.env.LOCAL_DATA_DIR ?? ".data",
  adminEmail: process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET,
};

/** TAPCARD_DEV_MODE=1 allows dev checkout under `next start` locally. It is ignored on Vercel production deployments. */
export const isProduction = () =>
  process.env.VERCEL_ENV === "production" || (process.env.NODE_ENV === "production" && process.env.TAPCARD_DEV_MODE !== "1");

export const hasStripe = () => Boolean(env.stripeSecretKey);
export const hasSupabase = () => Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
export const hasEmail = () => Boolean(env.resendApiKey && env.emailFrom);
export const hasAdmin = () =>
  Boolean(env.adminEmail && env.adminPasswordHash && env.adminSessionSecret && env.adminSessionSecret.length >= 32);

/**
 * Development checkout: when Stripe isn't configured and we're not in
 * production, checkout saves the order as "Pending payment" without taking
 * any payment, so the order flow and admin can be exercised locally.
 */
export const devCheckoutEnabled = () => !hasStripe() && !isProduction();

export const stripeMode = (): "test" | "live" | "dev" | "unconfigured" =>
  env.stripeSecretKey
    ? env.stripeSecretKey.startsWith("sk_live_")
      ? "live"
      : "test"
    : devCheckoutEnabled()
      ? "dev"
      : "unconfigured";
