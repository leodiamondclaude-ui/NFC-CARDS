# TAPFORM storefront

A premium e-commerce site for programmable NFC cards, built with Next.js 16.4 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript and Tailwind CSS 4.

"TAPFORM" is a placeholder brand. The name, contact details, shipping rules and discount codes live in `src/config/site.ts`; products, finishes and **sample prices** live in `src/config/products.ts`; marketing copy (FAQ, use cases) lives in `src/config/content.ts`; colors live as tokens at the top of `src/app/globals.css`.

## What's included

| Area | Where |
| --- | --- |
| Home page: hero, benefits, featured products, how it works, use cases, business, FAQ | `src/app/page.tsx` |
| Catalog with search, category and finish filters, sorting (URL-driven) | `src/app/shop`, `src/components/shop/shop-browser.tsx` |
| Product pages: live multi-angle preview, finishes, personalization, artwork upload, destination, quantity, specs, delivery estimate, related products, Product JSON-LD | `src/app/shop/[slug]` |
| Card customizer | `src/app/customize`, `src/components/shop/configurator.tsx` |
| Cart (persisted in localStorage), discount codes, shipping options | `src/app/cart`, `src/lib/cart-store.ts` |
| Checkout: guest checkout, address, shipping method, Stripe Checkout | `src/app/checkout`, `src/app/api/checkout` |
| Payment verification by webhook only | `src/app/api/webhooks/stripe` |
| Private artwork uploads (type sniffed from bytes, 10 MB limit) | `src/app/api/uploads`, `src/lib/server/uploads.ts` |
| Bulk quote form | `src/app/business`, `src/app/api/quote` |
| Email templates (order, shipping, setup, quote, password reset) | `src/lib/server/email.ts` |
| Brand and policy pages, sitemap, robots, OG image | `src/app/*` |
| Database schema with RLS | `supabase/migrations/0001_init.sql` |

### How payments stay honest

- The browser sends only product slugs, finishes, quantities and configuration. `computeTotals` (`src/lib/pricing.ts`) reprices everything from the catalog on the server.
- An order is created as `pending_payment`. Only the Stripe webhook can move it to `paid`, and only if the amount Stripe collected equals the order total.
- The success page only reads the order status; reaching it never marks anything paid.
- Card numbers never touch this app; Stripe Checkout collects them.
- Without `STRIPE_SECRET_KEY`, checkout clearly says payments aren't connected and creates no order.

### NFC programming

Browsers can't write to arbitrary NFC cards, so the site doesn't pretend to. The customer's destination (website, digital business card, social profile, link-in-bio or contact record) is validated and stored with the order item; fulfillment staff program and test the card before shipping. The site explains the difference between a fixed link and a page the customer can edit.

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional: add keys to enable payments, storage and email
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm test` (Vitest: pricing, discounts, destinations, order status, upload sniffing), `npm run typecheck`.

Without Supabase configured, orders, inquiries and uploads are written to `.data/` (git-ignored). That's for local development only; it won't persist on serverless hosts.

## Enable test payments (Stripe)

1. Create a Stripe account and copy the **test** secret key into `STRIPE_SECRET_KEY`.
2. Forward webhooks locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and put the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.
3. Check out with card `4242 4242 4242 4242`. The order flips to `paid` when the webhook arrives.
4. In production, add a webhook endpoint at `https://YOUR_DOMAIN/api/webhooks/stripe` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired`.

Going live: switch both values to live keys, set `NEXT_PUBLIC_SITE_URL` to the real domain, and decide on sales tax (for example by enabling Stripe Tax and adding `automatic_tax` to the session in `src/app/api/checkout/route.ts`). Tax is not calculated today.

## Database and storage (Supabase)

1. Create a Supabase project and run `supabase/migrations/0001_init.sql`.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose it to the browser).
3. The migration creates a **private** `customer-uploads` bucket. Staff should view artwork with short-lived signed URLs.

The catalog is still read from `src/config/products.ts`. To manage products in the database, swap the functions in `src/lib/catalog.ts` for queries against the `products` and `product_variants` tables.

## Email (Resend)

Set `RESEND_API_KEY`, `EMAIL_FROM` (a verified sender) and `SALES_INBOX`. The app reports an email as sent only when the provider accepts it.

## Before launch

- Replace sample prices, chip specs and stock in `src/config/products.ts` with your supplier's real values.
- Replace placeholder emails in `src/config/site.ts` and add real social links (empty entries are hidden).
- Have the policy pages (`/privacy`, `/terms`, `/shipping`, `/returns`) reviewed for your jurisdiction.
- Replace or remove the sample discount codes.
- Add rate limiting to `/api/uploads` and `/api/quote` at your host or edge.

## Next steps (not built yet)

- Customer accounts and order history (Supabase Auth; `/account` currently explains guest checkout).
- Admin dashboard for orders, inventory, prices, discount codes and inquiries (schema and RLS policies are ready).
- Editable digital profile pages at `/p/[slug]` (the `digital_profiles` table is ready).
