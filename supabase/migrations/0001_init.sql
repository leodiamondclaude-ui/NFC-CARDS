-- TAPCARD schema (Supabase / Postgres).
-- Apply with `supabase db push`, or paste into the Supabase SQL editor.
--
-- Access model
--   * The Next.js server uses the service-role key (server-only env var),
--     which bypasses RLS. It is never sent to the browser.
--   * RLS is enabled on every table. The anon and authenticated roles can
--     read the active catalog and nothing else, except the optional
--     customer-account policies at the bottom. Orders, customers, uploads
--     and inquiries are unreachable with the public anon key.
--   * Column names match src/lib/server/*.ts; the app writes rows as-is.

-- Catalog --------------------------------------------------------------------
create table if not exists products (
  id text primary key,                                   -- e.g. prod_essential
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  category text not null check (category in ('cards','custom','business')),
  short_description text not null default '',
  description text not null default '',
  price integer not null check (price >= 50),            -- cents
  starting_at boolean not null default false,
  units_per_pack integer not null default 1 check (units_per_pack > 0),
  custom_fields jsonb not null default '[]',             -- ["printedName","jobTitle","company","profileUrl","logo"]
  quote_cta boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true,
  specs jsonb not null default '[]',
  faq jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_variants (
  id text primary key,                                   -- e.g. var_essential_black
  product_id text not null references products(id) on delete cascade,
  name text not null,
  finish text not null check (finish in ('black','white','metallic','navy')),
  sku text unique not null,
  inventory integer check (inventory >= 0),              -- null = not tracked
  available boolean not null default true,
  position integer not null default 0
);
create index if not exists product_variants_product_idx on product_variants (product_id);

create table if not exists product_images (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  url text not null,                                     -- public URL in the product-images bucket
  storage_path text not null,
  alt text not null default '',
  position integer not null default 0
);
create index if not exists product_images_product_idx on product_images (product_id);

-- Customers and orders -------------------------------------------------------
create table if not exists customers (
  id uuid primary key,
  email text unique not null,
  name text not null,
  phone text,
  -- Optional customer accounts: link a Supabase Auth user here when accounts are enabled.
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key,
  number text unique not null check (number ~ '^TC-[A-F0-9]{8}$'),
  email text not null,
  phone text,
  customer_id uuid references customers(id),
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','processing','shipped','delivered','canceled','refunded')),
  currency text not null default 'usd',
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0),
  discount_code text,
  shipping integer not null check (shipping >= 0),
  total integer not null check (total >= 0),
  shipping_method text not null,
  shipping_address jsonb not null,
  payment_provider text not null check (payment_provider in ('stripe','dev')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  amount_paid integer,
  tracking_carrier text,
  tracking_number text,
  tracking_url text check (tracking_url is null or tracking_url ~ '^https?://'),
  notes text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  updated_at timestamptz not null default now(),
  -- An order only counts as paid with a recorded payment, and dev orders can never be paid.
  constraint paid_requires_payment check (paid_at is null or (amount_paid is not null and payment_provider = 'stripe'))
);
create index if not exists orders_email_idx on orders (email);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_idx on orders (created_at desc);

create table if not exists order_items (
  id uuid primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id text not null,
  product_slug text not null,
  product_name text not null,
  variant_id text not null,
  variant_name text not null,
  sku text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0),
  -- { printedName, jobTitle, company, profileUrl, logoUploadId, logoName }
  customization jsonb
);
create index if not exists order_items_order_idx on order_items (order_id);

-- Stripe events already processed (makes webhook handling idempotent).
create table if not exists webhook_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- Leads ----------------------------------------------------------------------
create table if not exists bulk_inquiries (
  id uuid primary key,
  name text not null,
  email text not null,
  company text not null,
  quantity integer not null check (quantity > 0),
  inquiry_type text not null check (inquiry_type in ('bulk','branding','team','other')),
  details text not null,
  status text not null default 'new' check (status in ('new','contacted','quoted','won','closed')),
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key,
  name text not null,
  email text not null,
  order_number text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Row level security -----------------------------------------------------------
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table webhook_events enable row level security;
alter table bulk_inquiries enable row level security;
alter table contact_messages enable row level security;

-- Public catalog: read-only, active products only. No public writes anywhere.
create policy "Public can read active products" on products
  for select to anon, authenticated using (active);
create policy "Public can read variants of active products" on product_variants
  for select to anon, authenticated using (exists (select 1 from products p where p.id = product_id and p.active));
create policy "Public can read images of active products" on product_images
  for select to anon, authenticated using (exists (select 1 from products p where p.id = product_id and p.active));

-- Optional customer accounts (structure only; the app uses guest checkout today).
-- A signed-in user can read their own customer record and orders, never anyone else's.
create policy "Customers read their own record" on customers
  for select to authenticated using (auth_user_id = auth.uid());
create policy "Customers read their own orders" on orders
  for select to authenticated using (customer_id in (select id from customers where auth_user_id = auth.uid()));
create policy "Customers read their own order items" on order_items
  for select to authenticated using (order_id in (
    select o.id from orders o join customers c on c.id = o.customer_id where c.auth_user_id = auth.uid()
  ));

-- webhook_events, bulk_inquiries and contact_messages have no policies:
-- only the server (service role) can read or write them.

-- Storage ----------------------------------------------------------------------
-- customer-uploads is PRIVATE: logos are only readable by the server, and admins
-- download them through /api/admin/uploads/[id] as attachments.
-- product-images is PUBLIC (read-only) so product photos can be served directly.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('customer-uploads', 'customer-uploads', false, 5242880, array['image/png','image/jpeg','application/pdf']),
  ('product-images', 'product-images', true, 8388608, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
