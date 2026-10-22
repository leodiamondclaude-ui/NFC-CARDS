-- TAPFORM initial schema (Supabase / Postgres).
-- Apply with `supabase db push` or paste into the SQL editor.
-- The storefront server talks to these tables with the service-role key,
-- which bypasses RLS. RLS is enabled everywhere so that the anon key and
-- signed-in customers can only reach what the policies below allow.

create extension if not exists "pgcrypto";

-- Catalog -------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null check (category in ('everyday','metal','custom','teams','accessories')),
  form text not null default 'card' check (form in ('card','fob')),
  price integer not null check (price >= 0),            -- cents
  units_per_pack integer not null default 1 check (units_per_pack > 0),
  tagline text not null default '',
  description text not null default '',
  highlights text[] not null default '{}',
  specs jsonb not null default '[]',
  customizable boolean not null default false,
  accepts_logo boolean not null default false,
  popularity integer not null default 100,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,                            -- public "product-images" bucket
  alt text not null default '',
  position integer not null default 0
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  finish_id text not null,                               -- matches src/config/products.ts finishes
  sku text unique,
  price_override integer check (price_override >= 0),
  unique (product_id, finish_id)
);

create table inventory (
  variant_id uuid primary key references product_variants(id) on delete cascade,
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  updated_at timestamptz not null default now()
);

create table customization_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  kind text not null check (kind in ('text','subtext','logo','destination')),
  max_length integer,
  required boolean not null default false
);

-- Customers and orders -------------------------------------------------------
create table customers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create type order_status as enum ('pending_payment','paid','in_production','shipped','delivered','cancelled','refunded');

create table orders (
  id uuid primary key,
  number text unique not null,
  customer_id uuid references customers(id),             -- null for guest checkout
  email text not null,
  status order_status not null default 'pending_payment',
  currency text not null default 'usd',
  subtotal integer not null,
  discount integer not null default 0,
  discount_code text,
  shipping integer not null,
  total integer not null,
  shipping_method text not null,
  shipping_address jsonb not null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  amount_paid integer,
  tracking jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index orders_email_idx on orders (lower(email));
create index orders_status_idx on orders (status);

create table order_items (
  id uuid primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  finish_id text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null,
  line_total integer not null,
  customization jsonb,          -- { text, subtext, uploadId, uploadName }
  destination jsonb,            -- see src/lib/destinations.ts
  destination_summary text
);
create index order_items_order_idx on order_items (order_id);

create table discount_codes (
  code text primary key,
  description text not null default '',
  kind text not null check (kind in ('percent','fixed')),
  value integer not null check (value > 0),
  min_subtotal integer,
  active boolean not null default true,
  expires_at timestamptz
);

create table bulk_inquiries (
  id uuid primary key,
  name text not null,
  email text not null,
  company text not null,
  quantity integer not null,
  timeline text not null,
  message text,
  status text not null default 'new' check (status in ('new','contacted','quoted','won','lost')),
  created_at timestamptz not null default now()
);

-- Digital profiles (for the planned editable profile pages) ---------------------
create table digital_profiles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  slug text unique not null check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$'),
  name text not null,
  title text,
  company text,
  avatar_path text,
  email text,
  phone text,
  website text,
  links jsonb not null default '[]',
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Row level security ------------------------------------------------------------
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table inventory enable row level security;
alter table customization_options enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table discount_codes enable row level security;
alter table bulk_inquiries enable row level security;
alter table digital_profiles enable row level security;

create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from customers where id = auth.uid() and role = 'admin');
$$;

-- Public catalog is readable by anyone.
create policy "catalog read" on products for select using (active or is_admin());
create policy "images read" on product_images for select using (true);
create policy "variants read" on product_variants for select using (true);
create policy "options read" on customization_options for select using (true);

-- Customers see only their own record, orders and items.
create policy "self read" on customers for select using (id = auth.uid() or is_admin());
create policy "own orders" on orders for select using (customer_id = auth.uid() or is_admin());
create policy "own order items" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or is_admin()))
);

-- Profiles: public read when published, owner edit.
create policy "profiles public read" on digital_profiles for select using (published or customer_id = auth.uid());
create policy "profiles owner write" on digital_profiles for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());

-- Admin-only management.
create policy "admin catalog" on products for all using (is_admin()) with check (is_admin());
create policy "admin inventory" on inventory for all using (is_admin()) with check (is_admin());
create policy "admin orders" on orders for update using (is_admin()) with check (is_admin());
create policy "admin discounts" on discount_codes for all using (is_admin()) with check (is_admin());
create policy "admin inquiries" on bulk_inquiries for all using (is_admin()) with check (is_admin());

-- Storage -----------------------------------------------------------------------
-- Customer artwork lives in a PRIVATE bucket. No public policy is created, so
-- only the service role (the storefront server) and admins via signed URLs can read it.
insert into storage.buckets (id, name, public) values ('customer-uploads', 'customer-uploads', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;
