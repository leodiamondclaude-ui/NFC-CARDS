import "server-only";

/** Central place to read server configuration. See .env.example. */
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  uploadsBucket: process.env.SUPABASE_UPLOADS_BUCKET ?? "customer-uploads",
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM,
  salesInbox: process.env.SALES_INBOX,
  dataDir: process.env.LOCAL_DATA_DIR ?? ".data",
};

export const hasStripe = () => Boolean(env.stripeSecretKey);
export const hasSupabase = () => Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
export const hasEmail = () => Boolean(env.resendApiKey && env.emailFrom);

/** Stripe test keys start with sk_test_. Used to label the checkout clearly. */
export const stripeMode = (): "test" | "live" | "unconfigured" =>
  !env.stripeSecretKey ? "unconfigured" : env.stripeSecretKey.startsWith("sk_live_") ? "live" : "test";
