# TAPCARD storefront

An online store for NFC business cards. It's built with Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, React Hook Form and Zod, and Lucide icons. Stripe Checkout handles payments, Supabase handles the database and file storage, and Resend sends email.

You can run it with **no credentials**. In that case it uses a local JSON store in `.data/` and a development checkout that saves orders as *Pending payment* and never takes a payment.

> Prices, specs and policy text are **placeholders**. See "Business decisions before launch" at the end.

## Prerequisites

- Node.js 20.9 or newer (tested on Node 22) and npm
- Optional: a Stripe account (test mode is fine), a Supabase project, a Resend account, and the Stripe CLI for local webhooks

## Install and run locally

```bash
npm install
cp .env.example .env.local     # optional, everything works without keys
npm run dev                    # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates route types, then runs `tsc` |
| `npm test` | Vitest: pricing and tampering, variants, stock, discounts, order statuses, upload sniffing, admin auth |
| `npm run admin:hash` | Creates an admin password hash and session secret |

Without Stripe keys, `npm run dev` uses the development checkout. `npm start` treats itself as production and **disables** checkout unless you set `TAPCARD_DEV_MODE=1`. That flag is for your own machine only and is ignored on Vercel production.

## Environment variables

Everything is listed with comments in `.env.example`. Only `NEXT_PUBLIC_*` values reach the browser. Every secret is read in `src/lib/server/env.ts`, which is marked `server-only`.

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, Open Graph, Stripe redirects |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_UPLOADS_BUCKET`, `SUPABASE_PRODUCT_IMAGES_BUCKET` | Database and file storage |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` | Admin dashboard |
| `RESEND_API_KEY`, `EMAIL_FROM`, `SALES_INBOX` | Order, shipping and quote emails |
| `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | Optional analytics. They load only after the visitor accepts the cookie banner. |
| `LOCAL_DATA_DIR`, `TAPCARD_DEV_MODE` | Local development only |

## Database setup (Supabase)

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql`, either with `supabase db push` or by pasting it into the SQL editor. The migration creates:
   - the tables (see below);
   - row-level security on every table;
   - a **private** `customer-uploads` bucket;
   - a **public** read-only `product-images` bucket.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The service-role key bypasses RLS, so keep it server-only and never give it a `NEXT_PUBLIC_` name.
4. Start the app. The first request copies the starter catalog from `src/config/products.ts` into the empty `products` table. From then on, the database is the source of truth.

**Tables**

- `products`, `product_variants` (color, SKU, inventory, availability), `product_images`
- `customers`
- `orders`: payment status, fulfillment status, shipping address, tracking, notes
- `order_items`: variant and customization details
- `webhook_events`
- `bulk_inquiries`, `contact_messages`

The order statuses are Pending payment, Paid, Processing, Shipped, Delivered, Canceled and Refunded.

**Access policies**

- With the public anon key, the only thing anyone can read is the active catalog.
- Orders, customers, uploads and inquiries are reachable only by the server.
- A database constraint stops an order from being paid without a recorded Stripe payment.

**Without Supabase**, data goes to `.data/` (git-ignored). That store is for local development only and won't persist on serverless hosting.

## Stripe setup

1. Put your **test** secret key in `STRIPE_SECRET_KEY`.
2. For local webhooks, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, then copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`.
3. Check out using test card `4242 4242 4242 4242`. The order changes to **Paid** only when the signed webhook arrives.
4. In production, add a webhook endpoint at `https://YOUR_DOMAIN/api/webhooks/stripe` subscribed to these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`

How payments stay honest:

- **The browser sends no prices.** It sends only product slugs, variant ids, quantities and customization. The server reprices everything from the catalog in `src/lib/pricing.ts`. It also rejects inactive products, the wrong variant for a product, stock it doesn't have, and customization a product doesn't offer.
- **New orders start as Pending payment.** The webhook verifies Stripe's signature and checks the amount and currency. The update is conditional, so duplicate or late events can't charge for or process an order twice. Inventory goes down only once, on the event that actually confirms payment.
- **The success page only reads.** Visiting it never marks an order paid, and admins can't set "Paid" by hand.
- **Unfinished checkouts are canceled.** Abandoned sessions expire after an hour, and expired or failed checkouts cancel the unpaid order.
- **Card numbers never touch this app.**
- **Sales tax isn't calculated yet.** Consider Stripe Tax: add `automatic_tax` in `src/app/api/checkout/route.ts`.

## Admin access

There is **no default account or password**.

1. Run `npm run admin:hash` and enter a password of at least 12 characters.
2. Copy the printed `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` into your environment, and set `ADMIN_EMAIL`.
3. Restart the app and sign in at `/admin/login`.

How access is protected:

- The session is a signed, HttpOnly cookie that expires after 8 hours.
- Every admin page, server action and admin download checks the session on the server with `requireAdmin()`. Hidden buttons aren't relied on.
- Login attempts are rate-limited.
- Customer logo files are private. Admins download them as attachments, never rendered inline.

What the dashboard covers:

- **Overview:** order and revenue totals, where revenue counts only payments Stripe confirmed.
- **Orders:** search and status filter, items, customization, logo downloads, status changes, tracking (with an optional email to the customer), and internal notes.
- **Products:** create and edit, price, variants, inventory, photos, and marking a product unavailable.
- **Customers:** search, order counts and paid totals.
- **Inquiries:** quote requests with status tracking, plus contact messages.

## How to add or change products

Use **Admin → Products → New product**. Saved changes reach the storefront immediately: the catalog cache is tagged and refreshed on save.

- Enable only the customization fields you can actually produce.
- "Preview style" sets the color of the drawn card mockup.
- Uploaded photos replace the mockup.

`src/config/products.ts` is used only to seed an **empty** store. To re-seed locally, delete `.data/`.

Where other settings live:

- **Brand, contact emails, shipping rates, discount codes and upload limits:** `src/config/site.ts`
- **FAQ, benefits, use cases and testimonials:** `src/config/content.ts`. Answers marked `configurable` depend on your policies.
- **Colors:** `src/app/globals.css`

## Deployment (Vercel)

1. Push the repository to GitHub and import it in Vercel.
2. Set the environment variables from `.env.example`. At minimum:
   - `NEXT_PUBLIC_SITE_URL`
   - the Stripe keys
   - the Supabase URL and service-role key
   - the three admin variables
3. Run the Supabase migration.
4. Add the Stripe webhook endpoint described above.
5. Deploy, then place a test-mode order end to end before switching to live keys.

**The rate limiter is in memory, per instance.** On serverless hosting, add a shared limiter (for example Upstash Redis) or your host's firewall rules for `/api/*` and the admin login.

**Self-hosting on more than one instance?** Set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` to the same value on every instance.

## Project map

| Area | Where |
| --- | --- |
| Storefront pages | `src/app/(store)/…` |
| Product page with gallery, variants, customization and logo upload | `src/app/(store)/shop/[slug]`, `src/components/shop/product-purchase.tsx` |
| Cart (localStorage, validated against the catalog) | `src/lib/cart-store.ts`, `src/components/cart/*` |
| Checkout API and Stripe webhook | `src/app/api/checkout`, `src/app/api/webhooks/stripe` |
| Guest order lookup | `src/app/(store)/orders` |
| Admin | `src/app/admin` |
| Server data access | `src/lib/server/*` |
| Schema | `supabase/migrations/0001_init.sql` |

## Prepared but not switched on

- **Customer accounts:** the `customers.auth_user_id` column and RLS policies are ready. Guest checkout stays the default.
- **Analytics and marketing events:** `src/lib/analytics.ts` covers view item, add to cart, begin checkout and lead. GA and Meta Pixel load only with an ID and consent. Email marketing or abandoned-cart tools can plug into the same events.
- **Discount codes:** set in `src/config/site.ts`. Referral codes can reuse the same mechanism.

## Business decisions before launch

- Final prices, card materials, chip type and finishes. Many specs currently say "To be confirmed".
- What each product includes for setup, for example whether you program the card or the customer does.
- Real shipping rates, production times, countries served, and the returns window.
- Your legal entity and address, and lawyer-reviewed Privacy, Terms, Shipping and Returns pages. Set `site.legalName` to remove the template notice.
- Real contact emails and social links.
- Whether to keep the `WELCOME10` sample discount.
- Sales tax handling.
- Genuine testimonials (with permission) to replace the labeled samples.
- Product photography.
